function detectPulse (rpmInput: number) {
    if (rpmInput > 255) {
        rpmCounting = 0
    } else if (rpmCounting == 0) {
        rpmCounting = 1
        rpmCount += 1
        if (rpmCount > 5) {
            ThisTime = input.runningTimeMicros()
            rpmTimes.pop()
            rpmTimes.unshift(ThisTime)
            TimingSum = rpmTimes[0] - rpmTimes[3]
            RPM = 60000000 / (TimingSum / (rpmTimes.length - 1))
        }
    }
}

function reset() {
    pins.digitalWritePin(DigitalPin.P0, 1)
    pins.digitalWritePin(DigitalPin.P0, 0)
    basic.pause(10)
    pins.digitalWritePin(DigitalPin.P0, 1)
    //serial.writeLine("Device reset")
    let status = pins.i2cReadNumber(0x18, NumberFormat.UInt8LE, false)
    //serial.writeLine("" + status)
}

function readPressure () {
    // send 0xAA, then 00
    pins.i2cWriteNumber(0x18, 0xAA, NumberFormat.UInt8LE, false)
    pins.i2cWriteNumber(0x18, 0x00, NumberFormat.UInt8LE, false)
    pins.i2cWriteNumber(0x18, 0x00, NumberFormat.UInt8LE, false)
    // read until status is read
    let startTime = input.runningTime()
    while (true) {
        // mapStatus = pins.i2cReadNumber(0x18, NumberFormat.UInt8LE, false)
        let eoc = pins.digitalReadPin(DigitalPin.P2)
        if (eoc) break
        // if ((mapStatus & 0x20) == 0) {
        //     break
        // }
        let time = input.runningTime()
        if (time - startTime > 1000) {
            serial.writeLine("Breaking due to not ready after 5 tries")
            break
        }
    }
    // mapStatus = pins.i2cReadNumber(0x18, NumberFormat.UInt8LE, true)
    // mapByte3 = pins.i2cReadNumber(0x18, NumberFormat.UInt8LE, true)
    // mapByte2 = pins.i2cReadNumber(0x18, NumberFormat.UInt8LE, true)
    // mapByte1 = pins.i2cReadNumber(0x18, NumberFormat.UInt8LE, false)
    // serial.writeString("Status:")
    // serial.writeNumber(mapStatus)
    // serial.writeString(",Byte3:")
    // serial.writeNumber(mapByte3)
    // serial.writeString(",Byte2:")
    // serial.writeNumber(mapByte2)
    // serial.writeString(",Byte1:")
    // serial.writeNumber(mapByte1)
    // serial.writeString(",")
    let mapTotal = pins.i2cReadNumber(0x18, NumberFormat.UInt32BE, false)
    mapStatus = (mapTotal & 0xFF000000) >> 24
    MAP = (mapTotal & 0xFFFFFF)
    serial.writeLine("" + mapStatus + "," + MAP + "," + AFR)
}

serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    let afrReading = serial.readLine()
    try {
        AFR = parseInt(afrReading)
    } catch {
        AFR = -1
    }
    serial.writeLine("" + AFR)
})

let RpmLevel = 0
let AFR = 0
let RPM = 0
let MAP = 0
let mapByte1 = 0
let mapByte2 = 0
let mapByte3 = 0
let mapStatus = 0
let TimingSum = 0
let ThisTime = 0
let rpmCount = 0
let rpmCounting = 0
let rpmTimes: number[] = []
rpmTimes = [0,0,0,0]
// init
serial.setRxBufferSize(32)
serial.setBaudRate(9600)
serial.redirect(SerialPin.USB_TX, SerialPin.P8, 9600)
reset()

loops.everyInterval(200, function () {
    readPressure()
    // serial.writeLine("" + RPM + "," + MAP + "," + rpmTimes.length)
})

basic.forever(function () {
    RpmLevel = pins.analogReadPin(AnalogReadWritePin.P1)
    detectPulse(RpmLevel)
})


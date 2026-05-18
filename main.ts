pins.onPulsed(DigitalPin.P1, PulseValue.Low, function () {
    ThisTime = control.millis()
    list.pop()
    list[0] = ThisTime
    TimingSum = 0
    for (let index = 0; index <= list.length; index++) {
        TimingSum = TimingSum + list[index]
    }
    RPM = TimingSum / list.length
})
serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    AFR = serial.readLine()
})
let MAP = 0
let AFR = ""
let RPM = 0
let TimingSum = 0
let ThisTime = 0
let list: number[] = []
list = [
0,
0,
0,
0
]
basic.forever(function () {
    MAP = pins.i2cReadNumber(24, NumberFormat.Int16LE, false)
    serial.writeLine("" + RPM + "," + MAP + ",Value")
    basic.pause(200)
})

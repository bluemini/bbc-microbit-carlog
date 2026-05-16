serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    AFR = serial.readLine()
})
let MAP = 0
let AFR = ""
serial.redirect(
SerialPin.USB_TX,
SerialPin.P0,
BaudRate.BaudRate115200
)
basic.forever(function () {
    MAP = pins.analogReadPin(AnalogReadWritePin.P1)
    datalogger.mirrorToSerial(true)
    datalogger.log(
    datalogger.createCV("AFR", AFR),
    datalogger.createCV("MAP", MAP)
    )
    basic.pause(1000)
})

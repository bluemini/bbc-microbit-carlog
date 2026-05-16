serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    AFR = serial.readLine()
})
let MAP = 0
let AFR = ""
serial.setBaudRate(BaudRate.BaudRate9600)
basic.forever(function () {
    MAP = pins.analogReadPin(AnalogPin.P0)
    datalogger.log(
    datalogger.createCV("Time", input.runningTime()),
    datalogger.createCV("AFR", AFR),
    datalogger.createCV("MAP", MAP)
    )
    basic.pause(1000)
})

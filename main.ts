function parseCtrlMsg (ctrlMsg: string) {
    index = 0
    strTmp = ""
    for (let index = 0; index <= 3; index++) {
        strTmp = "" + strTmp + ctrlMsg.charAt(index + 3)
    }
    rudder = Math.trunc(-300 + 0.2 * parseFloat(strTmp))
    strTmp = ""
    for (let index = 0; index <= 3; index++) {
        strTmp = "" + strTmp + ctrlMsg.charAt(index + 7)
    }
    thro = Math.trunc(-100 + 0.1 * parseFloat(strTmp))
}
bluetooth.onBluetoothConnected(function () {
    basic.showIcon(IconNames.Yes)
    connectFlag = true
})
bluetooth.onBluetoothDisconnected(function () {
    basic.showIcon(IconNames.No)
    connectFlag = false
    thro = 0
    pins.analogWritePin(AnalogPin.P1, 0)
    pins.analogWritePin(AnalogPin.P2, 0)
})
input.onButtonPressed(Button.A, function () {
    roll_adjust += -1
    basic.showString("" + (roll_adjust))
})
bluetooth.onUartDataReceived(serial.delimiters(Delimiters.Hash), function () {
    ctrlMsg = bluetooth.uartReadUntil(serial.delimiters(Delimiters.Hash))
    parseCtrlMsg(ctrlMsg)
})
input.onButtonPressed(Button.AB, function () {
    Pw_multiple = Pw_multiple + 0.5
    basic.showNumber(Pw_multiple)
    basic.showString("+")
})
input.onButtonPressed(Button.B, function () {
    roll_adjust += 1
    basic.showString("" + (roll_adjust))
})
let power_Reduce = 0
let delta_roll = 0
let current_roll = 0
let ctrlMsg = ""
let connectFlag = false
let strTmp = ""
let index = 0
let roll_adjust = 0
let Pw_multiple = 0
let thro = 0
let rudder = 0
bluetooth.setTransmitPower(7)
bluetooth.startUartService()
basic.showIcon(IconNames.Happy)
rudder = 0
thro = 0
let power = 0
let power_L = 0
let power_R = 0
let target_roll = 0
let para_thro2PWM = 10
let para_rudder2angle = 2
Pw_multiple = 3
let power_Max = 1023
roll_adjust = 0
pins.analogWritePin(AnalogPin.P1, power)
pins.analogWritePin(AnalogPin.P2, power)
basic.forever(function () {
    power = thro * para_thro2PWM
    current_roll = input.rotation(Rotation.Roll)
    if (connectFlag && thro > 0 && input.acceleration(Dimension.Z) < 800) {
        target_roll = Math.trunc(rudder / para_rudder2angle)
        delta_roll = target_roll + roll_adjust - current_roll
        power_L = Math.trunc(power + delta_roll * Pw_multiple)
        power_R = Math.trunc(power - delta_roll * Pw_multiple)
        if (power_L > power_Max) {
            power_Reduce = power_L - power_Max
            power_L = power_L - power_Reduce
            power_R = power_R - power_Reduce
        } else if (power_R > power_Max) {
            power_Reduce = power_R - power_Max
            power_L = power_L - power_Reduce
            power_R = power_R - power_Reduce
        }
        pins.analogWritePin(AnalogPin.P1, power_L)
        pins.analogWritePin(AnalogPin.P2, power_R)
    } else {
        pins.analogWritePin(AnalogPin.P1, 0)
        pins.analogWritePin(AnalogPin.P2, 0)
    }
})

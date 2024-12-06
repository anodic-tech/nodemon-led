import * as midi from 'midi'

const MIDI_SERVER = "IAC Driver Bus 4"
const INTENSITY_CC = 74

console.log(`Connecting MIDI IN to ${MIDI_SERVER}`)

let midiMap = Array(6).fill(0).map(() => (Array(128) as number[]).fill(0))
let brightnessMap = Array(6).fill(1)

// create a new output object
const midiIn = new midi.Input()

// enumerate available output ports
for (var i = 0; i < midiIn.getPortCount(); i++) {
    var portName = midiIn.getPortName(i)
    if (portName.indexOf(MIDI_SERVER) !== -1) {
        midiIn.openPort(i)
        console.log('Connected to ' + portName)
        break
    }
}

midiIn.on('message', (deltaTime, message) => {
    try{
        const parsedMessage = parseMidiMessage(message)
        // console.log(parsedMessage)
        if (parsedMessage.command === 9) {
            midiMap[parsedMessage.channel][parsedMessage.note] = 1
        }
        else if (parsedMessage.command === 8) {
            midiMap[parsedMessage.channel][parsedMessage.note] = 0
        }
        else if (parsedMessage.command === 11) {
            if(parsedMessage.note != INTENSITY_CC) return
            brightnessMap[parsedMessage.channel] = parsedMessage.velocity/127
        }
    } catch (e) {
        console.error(e)
    }
})

/**
 * Parse basic information out of a MIDI message.
 */
function parseMidiMessage(message:number[]) {
    return {
      command: message[0] >> 4,
      channel: message[0] & 0xf,
      note: message[1],
      velocity: message[2]
    }
}

// midiIn.addListener("noteon", e => {
//     midiMap[e.message.channel-1][e.note.number] = 1
// })

// midiIn.addListener("noteoff", e => {
//     midiMap[e.message.channel-1][e.note.number] = 0
// })

// midiIn.addListener("controlchange", e => {
//     if(e.controller.number != INTENSITY_CC) return
//     brightnessMap[e.message.channel-1] = Math.log10((e.value as number)*9+1)
// })

const LED_COUNT = 16

type Rgb = number[]

const COLORS: Rgb[] = [
  [1,0,0], //RED
  [0,1,0], //GREEN
  [0,0,1], //BLUE
  [1,1,0], //YELLOW
  [0,1,1], //TEAL
  [1,0,1] //PURPLE
]

export const getRgb = () => {

  let rgbMap = (Array(LED_COUNT) as Rgb[]).fill([0,0,0])  

  midiMap.forEach((channelNotes, i) => {
    channelNotes.forEach( (value:number, n: number) => {
      const color = COLORS[i].map((v: number) => {
        return Math.floor(v*brightnessMap[i]*(value*255))
      })
      rgbMap = noteToRgb(rgbMap, n, color)
    })
  })
  return rgbMap
}

const addRgb = (rgb1:Rgb, rgb2:Rgb) => {
  return rgb1.map((value:number,i:number) => {
    const newValue = value + rgb2[i]
    if (newValue > 255) return 255
    return newValue
  })
}

const noteToRgb = (rgbMap: Rgb[], note:number, color:Rgb) => {

  const noteLed = [
    [0],
    [0,LED_COUNT/2],
    [0, 6, 11],
    [0,LED_COUNT/4,LED_COUNT/2,3*LED_COUNT/4],
    [0,3,6,10,13],
    [0,3,6,8,11,14],
    [],  
    [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]
  ].map(n=>n.map(i=>i+note%LED_COUNT)).map(n=>n.map(i=>i%LED_COUNT))

  return rgbMap.map((currentRgb,i) => {
    if (noteLed[Math.floor(note/LED_COUNT)].includes(i)) {
      return addRgb(currentRgb, color)
    }
    return currentRgb
  })

}
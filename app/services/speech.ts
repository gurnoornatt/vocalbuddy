// Types for Speech Recognition
interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string
        confidence: number
      }
    }
  }
  resultIndex: number
}

interface SpeechRecognitionErrorEvent {
  error: string
  message: string
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor
    webkitSpeechRecognition: SpeechRecognitionConstructor
  }
}

class SpeechService {
  private synthesis: SpeechSynthesis
  private voices: SpeechSynthesisVoice[]
  private recognition: SpeechRecognition | null = null
  private selectedVoice: SpeechSynthesisVoice | null = null

  constructor() {
    this.synthesis = window.speechSynthesis
    this.voices = []
    
    // Initialize speech recognition if available
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition()
      this.recognition.continuous = false
      this.recognition.interimResults = false
      this.recognition.lang = "en-US"
    }

    // Load voices when they're available
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = this.loadVoices.bind(this)
    }
    this.loadVoices()
  }

  private loadVoices() {
    this.voices = this.synthesis.getVoices()
    // Try to find a child-friendly voice (Google US English)
    this.selectedVoice =
      this.voices.find((voice) => voice.name === "Google US English" || voice.name.includes("en-US")) || this.voices[0]
  }

  speak(text: string, rate: number = 1): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error("Speech synthesis not supported"))
        return
      }

      // Cancel any ongoing speech
      this.synthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.voice = this.selectedVoice
      utterance.pitch = 1.2 // Slightly higher pitch for kid-friendly voice
      utterance.rate = rate // Use the provided rate
      utterance.onend = () => resolve()
      utterance.onerror = (error) => reject(error)

      this.synthesis.speak(utterance)
    })
  }

  startListening(
    onResult: (transcript: string) => void,
    onError: (error: string) => void,
    onEnd: () => void,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error("Speech recognition not supported"))
        return
      }

      // Add timeout to prevent long waiting periods
      const timeout = setTimeout(() => {
        this.recognition?.stop()
        onError("No speech detected. Please try again.")
      }, 5000) // 5 seconds timeout

      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        clearTimeout(timeout)
        const transcript = event.results[0][0].transcript
        onResult(transcript)
      }

      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        clearTimeout(timeout)
        let errorMessage = "There was an error with speech recognition."
        
        switch (event.error) {
          case "no-speech":
            errorMessage = "No speech was detected. Please try again."
            break
          case "audio-capture":
            errorMessage = "No microphone was found. Please check your microphone settings."
            break
          case "not-allowed":
            errorMessage = "Microphone access was denied. Please enable microphone access."
            break
          case "network":
            errorMessage = "Network error occurred. Please check your internet connection."
            break
        }
        
        onError(errorMessage)
      }

      this.recognition.onend = () => {
        clearTimeout(timeout)
        onEnd()
      }

      try {
        this.recognition.start()
        resolve()
      } catch (error) {
        clearTimeout(timeout)
        reject(error)
      }
    })
  }

  stopListening() {
    if (this.recognition) {
      this.recognition.stop()
    }
  }
}

// Export a singleton instance
export const speechService = new SpeechService() 
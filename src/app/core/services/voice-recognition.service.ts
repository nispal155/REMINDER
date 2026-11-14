import { Injectable, signal } from '@angular/core';

interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

@Injectable({
  providedIn: 'root'
})
export class VoiceRecognitionService {
  readonly isListening = signal<boolean>(false);
  readonly transcript = signal<string>('');
  readonly isSupported = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  private recognition: any = null;

  constructor() {
    this.initRecognition();
  }

  private initRecognition(): void {
    if (typeof window === 'undefined') return;

    const win = window as IWindow;
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (SpeechRec) {
      this.isSupported.set(true);
      try {
        this.recognition = new SpeechRec();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US'; // default, can transcribe Nepali / English phonetics

        this.recognition.onstart = () => {
          this.isListening.set(true);
          this.errorMessage.set(null);
        };

        this.recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          this.transcript.set(currentTranscript);
        };

        this.recognition.onerror = (event: any) => {
          this.isListening.set(false);
          this.errorMessage.set(event.error || 'Speech recognition error');
        };

        this.recognition.onend = () => {
          this.isListening.set(false);
        };
      } catch (e) {
        console.warn('SpeechRecognition initialization failed:', e);
        this.isSupported.set(false);
      }
    } else {
      this.isSupported.set(false);
    }
  }

  startListening(lang = 'en-US'): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition is not supported in this browser.'));
        return;
      }

      this.transcript.set('');
      this.recognition.lang = lang;

      this.recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        this.transcript.set(currentTranscript);
      };

      this.recognition.onend = () => {
        this.isListening.set(false);
        resolve(this.transcript());
      };

      this.recognition.onerror = (event: any) => {
        this.isListening.set(false);
        this.errorMessage.set(event.error);
        reject(new Error(event.error));
      };

      try {
        this.recognition.start();
      } catch (err) {
        this.isListening.set(false);
        reject(err);
      }
    });
  }

  stopListening(): void {
    if (this.recognition && this.isListening()) {
      this.recognition.stop();
      this.isListening.set(false);
    }
  }
}


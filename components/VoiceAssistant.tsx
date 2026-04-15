'use client';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2 } from 'lucide-react';

interface VoiceAssistantProps {
  workerId: string;
  workerName: string;
  tier: string;
  policyStatus: string;
  language: 'hi' | 'en';
}

export default function VoiceAssistant({
  workerId, workerName, tier, policyStatus, language
}: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const recognitionRef = useRef<any | null>(null);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input not supported in this browser. Please use Chrome.');
      return;
    }
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRec();
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = async (event: any) => {
      const spokenText = event.results[0][0].transcript;
      setTranscript(spokenText);
      setIsListening(false);
      await askClaude(spokenText);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  const askClaude = async (question: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/voice-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, workerId, workerName, tier, policyStatus, language }),
      });
      const data = await res.json();
      setResponse(data.answer);
      // Text-to-speech
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(data.answer);
        utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      setResponse('Sorry, I could not process that. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-xl border p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Volume2 className="w-4 h-4" />
        <span className="font-medium text-sm">OffShift Voice Assistant</span>
        <span className="text-xs text-muted-foreground ml-auto">
          {language === 'hi' ? 'हिंदी में बोलें' : 'Ask in English'}
        </span>
      </div>
      
      <Button
        variant={isListening ? 'outline' : 'outline'}
        size="sm"
        onClick={isListening ? () => recognitionRef.current?.stop() : startListening}
        className="w-full"
        disabled={isLoading}
      >
        {isListening ? (
          <><MicOff className="w-4 h-4 mr-2" /> Listening... tap to stop</>
        ) : (
          <><Mic className="w-4 h-4 mr-2" /> Tap to ask a question</>
        )}
      </Button>

      {transcript && (
        <p className="text-sm bg-muted rounded-lg p-2">
          <span className="text-muted-foreground text-xs">You: </span>{transcript}
        </p>
      )}
      {isLoading && <p className="text-sm text-muted-foreground animate-pulse">Thinking...</p>}
      {response && (
        <p className="text-sm rounded-lg border p-2 leading-relaxed">{response}</p>
      )}
    </div>
  );
}

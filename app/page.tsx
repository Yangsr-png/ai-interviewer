"use client";

import { useState, KeyboardEvent, useRef, useEffect, ChangeEvent } from 'react';

type Message = {
  role: 'user' | 'ai';
  content: string;
};

export default function Home() {
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [mode, setMode] = useState<'job' | 'project'>('job');
  
  // Datos del usuario
  const [context, setContext] = useState(""); 
  const [details, setDetails] = useState(""); 
  const [githubUrl, setGithubUrl] = useState(""); // NUEVO: URL del repo

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- NUEVA LÓGICA: LECTURA DE ARCHIVOS ---
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Usamos FileReader para leer el texto del archivo sin subirlo a un servidor
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      // Añadimos el contenido del archivo a la descripción automáticamente
      setDetails((prev) => prev + `\n\n--- CONTENIDO DEL ARCHIVO (${file.name}) ---\n` + text);
    };
    reader.readAsText(file);
  };
  // -----------------------------------------

  const startInterview = () => {
    if (!context.trim()) return;
    setIsInterviewStarted(true);
    
    const greeting = mode === 'job' 
      ? `Hola. Soy el reclutador para el puesto de ${context}. Cuéntame sobre ti.`
      : `Hola. Soy el tribunal. Veo que vas a presentar el proyecto "${context}" ${githubUrl ? `(Repo: ${githubUrl})` : ''}. Empieza tu defensa.`;

    setMessages([{ role: 'ai', content: greeting }]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input, 
          history: newHistory.slice(1), 
          context: context,
          mode: mode,
          details: details,
          githubUrl: githubUrl // Enviamos la URL también
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      const aiMessage: Message = { role: 'ai', content: data.reply };
      setMessages([...newHistory, aiMessage]);

    } catch (error) {
      console.error(error);
      alert("Error al conectar con la IA");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) handleSend();
  };

  if (!isInterviewStarted) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white p-4">
        <div className="max-w-xl w-full bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 overflow-y-auto max-h-[90vh]">
          <h1 className="text-3xl font-bold mb-6 text-center text-blue-400">AI Interviewer</h1>
          
          <div className="flex bg-gray-900 p-1 rounded-lg mb-6">
            <button 
              onClick={() => setMode('job')}
              className={`flex-1 py-2 rounded-md transition ${mode === 'job' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              💼 Entrevista Trabajo
            </button>
            <button 
              onClick={() => setMode('project')}
              className={`flex-1 py-2 rounded-md transition ${mode === 'project' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              🎓 Defensa Proyecto
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {mode === 'job' ? 'Puesto al que aspiras' : 'Nombre del Proyecto'}
              </label>
              <input 
                type="text" 
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder={mode === 'job' ? "Ej: Junior React Developer" : "Ej: E-commerce, App de Gestión..."}
                className="w-full p-3 rounded bg-gray-900 border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {mode === 'project' && (
              <div className="animate-fade-in space-y-4">
                
                {/* INPUT GITHUB URL */}
                <div>
                   <label className="block text-sm font-medium mb-2 text-purple-300">🔗 Link al Repositorio (GitHub/GitLab)</label>
                   <input 
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/usuario/repo"
                    className="w-full p-3 rounded bg-gray-900 border border-gray-600 focus:border-purple-500 focus:outline-none text-sm font-mono"
                  />
                </div>

                {/* INPUT FILE UPLOAD */}
                <div>
                   <label className="block text-sm font-medium mb-2 text-purple-300">📄 Subir README o Código (Opcional)</label>
                   <div className="flex items-center gap-2">
                     <input 
                      type="file"
                      accept=".md,.txt,.js,.ts,.java,.py,.json" // Limitamos tipos de archivo
                      onChange={handleFileUpload}
                      className="block w-full text-sm text-gray-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-purple-600 file:text-white
                        hover:file:bg-purple-700
                        cursor-pointer"
                    />
                   </div>
                   <p className="text-xs text-gray-500 mt-1">El contenido del archivo se añadirá automáticamente abajo 👇</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Contexto Técnico</label>
                  <textarea 
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Describe tu stack o sube un archivo arriba..."
                    className="w-full p-3 rounded bg-gray-900 border border-gray-600 focus:border-purple-500 focus:outline-none h-32 font-mono text-sm"
                  />
                </div>
              </div>
            )}

            <button 
              onClick={startInterview}
              disabled={!context.trim()}
              className={`w-full font-bold py-3 rounded-lg transition disabled:opacity-50 mt-4 text-white
                ${mode === 'job' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'}
              `}
            >
              {mode === 'job' ? 'Comenzar Entrevista' : 'Defender Proyecto'}
            </button>
          </div>
        </div>
      </main>
    );
  }

  // (El resto del renderizado del chat sigue igual que antes...)
  return (
    <main className="flex h-screen flex-row bg-white overflow-hidden">
        {/* Pega aquí el mismo código del return del chat que tenías en el paso anterior */}
        {/* Si lo necesitas completo dímelo, pero es idéntico a la versión anterior */}
         <div className="w-1/4 h-full bg-gray-900 text-white border-r border-gray-700 hidden md:flex flex-col p-6">
         <h2 className="font-bold text-xl mb-1">AI Interviewer</h2>
         <p className={`text-xs mb-8 font-mono font-bold ${mode === 'job' ? 'text-blue-400' : 'text-purple-400'}`}>
           MODO: {mode === 'job' ? 'RECRUITER' : 'PROFESOR'}
         </p>
         <div className="flex-1 overflow-y-auto text-sm text-gray-400">
             <p className="mb-2">{mode === 'job' ? '🎯 Objetivo: Conseguir el empleo.' : '🎓 Objetivo: Aprobar el TFG.'}</p>
             {githubUrl && <p className="mt-4 text-xs break-all">🔗 Repo: {githubUrl}</p>}
         </div>
         <button onClick={() => setIsInterviewStarted(false)} className="mt-auto text-sm text-gray-500 hover:text-white">← Salir</button>
      </div>

      <div className="flex-1 flex flex-col h-full bg-gray-50">
         <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-4 rounded-2xl max-w-2xl shadow-sm ${
                  msg.role === 'user' 
                    ? (mode === 'job' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white') 
                    : 'bg-white border border-gray-200 text-gray-800'
                } ${msg.role === 'user' ? 'rounded-br-none' : 'rounded-bl-none'}`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && <div className="p-4 bg-gray-200 rounded-lg w-fit animate-pulse text-xs">Pensando...</div>}
            <div ref={messagesEndRef} />
         </div>
         <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2 max-w-4xl mx-auto">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} disabled={isLoading} type="text" placeholder="Escribe tu respuesta..." className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
              <button onClick={handleSend} disabled={isLoading || !input.trim()} className="bg-purple-600 text-white px-6 py-2 rounded-xl hover:bg-purple-700 disabled:opacity-50">Enviar</button>
            </div>
         </div>
      </div>
    </main>
  );
}
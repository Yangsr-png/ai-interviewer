"use client"; 

import { useState } from 'react';

// Definimos la estructura de un mensaje
type Message = {
  role: 'user' | 'ai';
  content: string;
};

export default function Home() {
  
  // 1. ESTADO: Guardamos lo que escribe el usuario y la lista de mensajes
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'Hola, soy tu entrevistador AI. ¿Listo para empezar?' }
  ]);

  // 2. LÓGICA: Qué pasa al enviar
  const handleSend = () => {
    if (!input.trim()) return; // Si está vacío, no hacemos nada (Guard Clause)

    // Creamos el mensaje del usuario
    const newMessage: Message = { role: 'user', content: input };

    // ACTUALIZAMOS EL ARRAY
    // En React no se usa .push(). Se crea un array nuevo copiando los anteriores (...)
    setMessages([...messages, newMessage]);

    // Limpiamos el input
    setInput("");
  };
  
  // Permite enviar pulsando "Enter"
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <main className="flex h-screen flex-row bg-white">
      
      {/* SIDEBAR (Izquierda) */}
      <div className="w-1/4 h-full bg-gray-900 text-white border-r border-gray-700 hidden md:block">
        <div className="p-4">
           <h2 className="font-bold text-xl mb-4">AI Interviewer</h2>
           <div className="text-sm text-gray-400">
             Historial de sesión (Sprint 3)
           </div>
        </div>
      </div>

      {/* ÁREA PRINCIPAL (Derecha) */}
      <div className="flex-1 flex flex-col h-full bg-gray-50">
         
         {/* A. ZONA DE MENSAJES (Dinámica) */}
         <div className="flex-1 overflow-y-auto p-6 space-y-4">
            
            {/* BUCLE MÁGICO (.map) */}
            {/* Por cada mensaje 'msg' en el array 'messages', dibujamos una burbuja */}
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`
                  p-3 rounded-lg max-w-xl shadow-sm 
                  ${msg.role === 'user' 
                    ? 'bg-blue-600 text-white'  // Estilo Usuario
                    : 'bg-white border border-gray-200 text-gray-800' // Estilo IA
                  }
                `}>
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
            
         </div>

         {/* B. ZONA DE INPUT (Fija abajo) */}
         <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown} // Para enviar con Enter
                type="text" 
                placeholder="Escribe tu respuesta..." 
                className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
              <button 
                onClick={handleSend}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              >
                Enviar
              </button>
            </div>
         </div>

      </div>

    </main>
  );
}
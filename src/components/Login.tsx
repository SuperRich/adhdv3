import React, { useState } from 'react';
import { Brain, Heart, Lock } from 'lucide-react';

interface Props {
  onLogin: (isEmma: boolean) => void;
}

export function Login({ onLogin }: Props) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent, isEmma: boolean) => {
    e.preventDefault();
    const correctPassword = isEmma ? '76park' : 'PepsiMaxCard90';
    
    if (password === correctPassword) {
      onLogin(isEmma);
    } else {
      setError('Incorrect password');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Choose your space to continue</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <form 
            className="bg-white p-6 rounded-lg shadow-md space-y-4"
            onSubmit={(e) => handleSubmit(e, true)}
          >
            <div className="flex items-center justify-center">
              <div className="relative">
                <Heart className="w-12 h-12 text-pink-500" />
                <Brain className="w-8 h-8 text-purple-500 absolute -bottom-1 -right-1" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-center">Emma's Space</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Lock className="w-4 h-4 inline-block mr-1" />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-md text-white font-medium bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-colors"
            >
              Enter Emma's Space
            </button>
          </form>

          <form 
            className="bg-white p-6 rounded-lg shadow-md space-y-4"
            onSubmit={(e) => handleSubmit(e, false)}
          >
            <div className="flex items-center justify-center">
              <Heart className="w-12 h-12 text-pink-500" />
            </div>
            <h2 className="text-xl font-semibold text-center">Richard's Space</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Lock className="w-4 h-4 inline-block mr-1" />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-md text-white font-medium bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 transition-colors"
            >
              Enter Richard's Space
            </button>
          </form>
        </div>

        {error && (
          <p className="text-red-500 text-center font-medium">{error}</p>
        )}
      </div>
    </div>
  );
}
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, Brain, Calendar, MessageCircleHeart, UserCircle2, Flame } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { format } from 'date-fns';
import { appreciationsDB, scheduledMomentsDB, desiresDB } from './lib/db';
import { AppreciationCard } from './components/AppreciationCard';
import { ScheduleMoment } from './components/ScheduleMoment';
import DesiresList from './components/DesiresList';
import { ModeToggle } from './components/ModeToggle';
import { Login } from './components/Login';
import { EmmaWellbeing } from './components/EmmaWellbeing';
import { CalendarView } from './components/CalendarView';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isEmmaMode, setIsEmmaMode] = useState(true);
  const [isHotMode, setIsHotMode] = useState(false);
  const [newAppreciation, setNewAppreciation] = useState('');
  const queryClient = useQueryClient();

  const { data: appreciations = [] } = useQuery({
    queryKey: ['appreciations'],
    queryFn: () => appreciationsDB.getAll(),
  });

  const { data: scheduledMoments = [] } = useQuery({
    queryKey: ['scheduled-moments'],
    queryFn: () => scheduledMomentsDB.getAll(),
  });

  const { data: desires = [] } = useQuery({
    queryKey: ['desires'],
    queryFn: () => desiresDB.getAll(),
  });

  const filteredDesires = desires.filter(desire => {
    if (isHotMode) {
      return desire.isHot;
    }
    return !desire.isHot;
  });

  const addAppreciation = useMutation({
    mutationFn: (text: string) =>
      appreciationsDB.add({
        text,
        date: new Date(),
        author: isEmmaMode ? 'Emma' : 'Richard',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appreciations'] });
      toast.success('Appreciation shared!');
      setNewAppreciation('');
    },
  });

  const deleteAppreciation = useMutation({
    mutationFn: (id: number) => appreciationsDB.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appreciations'] });
      toast.success('Appreciation deleted');
    },
  });

  const addScheduledMoment = useMutation({
    mutationFn: scheduledMomentsDB.add,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-moments'] });
      toast.success('Moment scheduled!');
    },
  });

  const deleteScheduledMoment = useMutation({
    mutationFn: (id: number) => scheduledMomentsDB.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-moments'] });
      toast.success('Scheduled moment deleted');
    },
  });

  const addDesire = useMutation({
    mutationFn: desiresDB.add,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['desires'] });
      toast.success('Desire added!');
    },
  });

  const deleteDesire = useMutation({
    mutationFn: (id: number) => desiresDB.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['desires'] });
      toast.success('Desire deleted');
    },
  });

  const handleLogin = (isEmma: boolean) => {
    setIsEmmaMode(isEmma);
    setIsLoggedIn(true);
    toast.success(`Welcome back, ${isEmma ? 'Emma' : 'Richard'}!`);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <Toaster position="top-center" />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            {isEmmaMode ? (
              <>
                <div className="relative">
                  <Heart className="w-8 h-8 text-pink-500" />
                  <Brain className="w-5 h-5 text-purple-500 absolute -bottom-1 -right-1" />
                </div>
                Emma's Space
              </>
            ) : (
              <>
                <Heart className="w-8 h-8 text-pink-500" />
                Richard's Space
              </>
            )}
            {isHotMode && <Flame className="w-6 h-6 text-red-500" />}
          </h1>
          
          <div className="flex gap-4">
            <ModeToggle isHotMode={isHotMode} onToggle={() => setIsHotMode(!isHotMode)} />
            <button
              onClick={() => {
                setIsLoggedIn(false);
                setIsHotMode(false);
                toast.success('Logged out successfully');
              }}
              className="px-4 py-2 rounded-full font-medium transition-all bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-pink-500" />
              Calendar
            </h2>
            <CalendarView />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <MessageCircleHeart className="w-5 h-5 text-pink-500" />
                  Share an Appreciation
                </h2>
                
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newAppreciation.trim()) {
                      addAppreciation.mutate(newAppreciation);
                    }
                  }}
                  className="space-y-4"
                >
                  <textarea
                    value={newAppreciation}
                    onChange={(e) => setNewAppreciation(e.target.value)}
                    placeholder={`Tell ${isEmmaMode ? 'Richard' : 'Emma'} what you appreciate...`}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                    rows={3}
                  />
                  <button
                    type="submit"
                    className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                      isEmmaMode
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                        : 'bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600'
                    } transition-colors`}
                  >
                    Share Appreciation
                  </button>
                </form>
              </div>

              <div className="space-y-4">
                {appreciations.map((appreciation) => (
                  <AppreciationCard
                    key={appreciation.id}
                    appreciation={appreciation}
                    onDelete={deleteAppreciation.mutate}
                    currentUser={isEmmaMode ? 'Emma' : 'Richard'}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {isEmmaMode ? (
                <>
                  {!isHotMode ? (
                    <EmmaWellbeing
                      onSchedule={addScheduledMoment.mutate}
                      desires={filteredDesires}
                      isHotMode={isHotMode}
                      isEmmaMode={isEmmaMode}
                    />
                  ) : (
                    <>
                      <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-pink-500" />
                          Schedule a Moment
                        </h2>
                        
                        <ScheduleMoment
                          onSchedule={addScheduledMoment.mutate}
                          desires={filteredDesires}
                          isHotMode={isHotMode}
                          isEmmaMode={isEmmaMode}
                        />
                      </div>

                      <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                          <UserCircle2 className="w-5 h-5 text-pink-500" />
                          Richard's Desires
                        </h2>
                        
                        <DesiresList
                          desires={filteredDesires}
                          isEmmaMode={true}
                          onDelete={deleteDesire.mutate}
                          isHotMode={isHotMode}
                        />
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-500" />
                    Share Your Desires
                  </h2>
                  
                  <DesiresList
                    desires={filteredDesires}
                    isEmmaMode={false}
                    onDelete={deleteDesire.mutate}
                    onAdd={addDesire.mutate}
                    isHotMode={isHotMode}
                  />
                </div>
              )}

              <div className="space-y-4">
                {scheduledMoments.map((moment) => (
                  <div
                    key={moment.id}
                    className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {moment.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {format(new Date(moment.date), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                      {isEmmaMode && (
                        <button
                          onClick={() => moment.id && deleteScheduledMoment.mutate(moment.id)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <Calendar className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    <p className="mt-2 text-gray-700">{moment.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
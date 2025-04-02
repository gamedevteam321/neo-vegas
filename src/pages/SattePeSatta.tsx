import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCoins } from '@/contexts/CoinContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MainLayout from '@/components/layout/MainLayout';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export const SattePeSatta: React.FC = () => {
  const { user, isGuest } = useAuth();
  const { coins, removeCoins } = useCoins();
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const [entryFee, setEntryFee] = useState(100);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    if (currentRoom) {
      // Subscribe to room changes
      const roomSubscription = supabase
        .channel(`room:${currentRoom.code}`)
        .on('broadcast', { event: 'player_joined' }, ({ payload }) => {
          setPlayers(prev => [...prev, payload.player]);
        })
        .on('broadcast', { event: 'game_started' }, ({ payload }) => {
          setGameStarted(true);
          // TODO: Navigate to game interface
          navigate(`/satte-pe-satta/game/${currentRoom.code}`);
        })
        .subscribe();

      return () => {
        roomSubscription.unsubscribe();
      };
    }
  }, [currentRoom, navigate]);

  const handleCreateRoom = async () => {
    if (isGuest) {
      toast({
        title: "Guest Mode",
        description: "Please sign up to create or join rooms!",
        variant: "default",
      });
      navigate("/login");
      return;
    }

    if (entryFee > coins) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough coins for the entry fee.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingRoom(true);
    // Generate a 6-digit room code
    const newRoomCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    try {
      // Create room in Supabase
      const { data: room, error } = await supabase
        .from('rooms')
        .insert([
          {
            code: newRoomCode,
            entry_fee: entryFee,
            created_by: user?.id,
            status: 'waiting'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Add creator as first player
      const { error: playerError } = await supabase
        .from('players')
        .insert([
          {
            room_id: room.id,
            user_id: user?.id,
            username: user?.username || user?.email,
            coins: entryFee
          }
        ]);

      if (playerError) throw playerError;

      // Deduct entry fee
      removeCoins(entryFee);

      setRoomCode(newRoomCode);
      setCurrentRoom(room);
      setPlayers([{ user_id: user?.id, username: user?.username || user?.email, coins: entryFee }]);
      setIsCreator(true);
      
      toast({
        title: "Room Created",
        description: `Room code: ${newRoomCode}. Share this with your friends!`,
      });
    } catch (error) {
      console.error('Error creating room:', error);
      toast({
        title: "Error",
        description: "Failed to create room. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleJoinRoom = async () => {
    if (isGuest) {
      toast({
        title: "Guest Mode",
        description: "Please sign up to create or join rooms!",
        variant: "default",
      });
      navigate("/login");
      return;
    }

    if (!roomCode || roomCode.length !== 6) {
      toast({
        title: "Invalid Room Code",
        description: "Please enter a valid 6-digit room code.",
        variant: "destructive",
      });
      return;
    }

    if (entryFee > coins) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough coins for the entry fee.",
        variant: "destructive",
      });
      return;
    }

    setIsJoiningRoom(true);
    
    try {
      // Find room by code
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', roomCode)
        .single();

      if (roomError) throw roomError;

      if (!room) {
        throw new Error('Room not found');
      }

      if (room.status !== 'waiting') {
        throw new Error('Room is not available');
      }

      // Check if player already in room
      const { data: existingPlayer } = await supabase
        .from('players')
        .select('user_id, room_id')
        .eq('room_id', room.id)
        .eq('user_id', user?.id)
        .single();

      if (existingPlayer) {
        throw new Error('You are already in this room');
      }

      // Add player to room
      const { error: playerError } = await supabase
        .from('players')
        .insert([
          {
            room_id: room.id,
            user_id: user?.id,
            username: user?.username || user?.email,
            coins: entryFee
          }
        ]);

      if (playerError) throw playerError;

      // Deduct entry fee
      removeCoins(entryFee);

      // Broadcast player joined event
      await supabase
        .channel(`room:${room.code}`)
        .send({
          type: 'broadcast',
          event: 'player_joined',
          payload: {
            player: {
              user_id: user?.id,
              username: user?.username || user?.email,
              coins: entryFee
            }
          }
        });

      setCurrentRoom(room);
      setPlayers(prev => [...prev, { user_id: user?.id, username: user?.username || user?.email, coins: entryFee }]);
      setIsCreator(false);
      
      toast({
        title: "Success",
        description: "You have joined the room!",
      });
    } catch (error) {
      console.error('Error joining room:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to join room. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsJoiningRoom(false);
    }
  };

  const handleStartGame = async () => {
    if (!currentRoom || !isCreator) return;

    if (players.length < 3) {
      toast({
        title: "Not Enough Players",
        description: "You need at least 3 players to start the game.",
        variant: "destructive",
      });
      return;
    }

    if (players.length > 8) {
      toast({
        title: "Too Many Players",
        description: "Maximum 8 players allowed in a room.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update room status to 'playing'
      const { error: roomError } = await supabase
        .from('rooms')
        .update({ status: 'playing' })
        .eq('id', currentRoom.id);

      if (roomError) throw roomError;

      // Broadcast game started event
      await supabase
        .channel(`room:${currentRoom.code}`)
        .send({
          type: 'broadcast',
          event: 'game_started',
          payload: {
            players: players
          }
        });

      setGameStarted(true);
      // Navigate to game interface
      navigate(`/satte-pe-satta/game/${currentRoom.code}`);
    } catch (error) {
      console.error('Error starting game:', error);
      toast({
        title: "Error",
        description: "Failed to start the game. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <div className="game-layout">
        <h1 className="game-title">Satte Pe Satta</h1>
        
        <div className="game-interface">
          <div className="game-controls bg-casino-card rounded-xl p-4 md:p-6">
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-2">Entry Fee</p>
                <Input
                  type="number"
                  min={100}
                  max={coins}
                  value={entryFee}
                  onChange={(e) => setEntryFee(parseInt(e.target.value) || 100)}
                  className="bg-casino-background border-casino-muted text-white"
                />
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-2">Room Code</p>
                <Input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="bg-casino-background border-casino-muted text-white"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={handleCreateRoom}
                  disabled={isCreatingRoom || isJoiningRoom}
                >
                  Create Room
                </Button>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={handleJoinRoom}
                  disabled={isCreatingRoom || isJoiningRoom}
                >
                  Join Room
                </Button>
              </div>

              {currentRoom && (
                <div className="mt-4 p-4 bg-casino-background rounded-lg">
                  <h3 className="text-white font-semibold mb-2">Room Info</h3>
                  <p className="text-white">Code: {currentRoom.code}</p>
                  <p className="text-white">Entry Fee: {currentRoom.entry_fee} coins</p>
                  <div className="mt-2">
                    <h4 className="text-white font-semibold mb-1">Players ({players.length}/8):</h4>
                    <ul className="space-y-1">
                      {players.map((player, index) => (
                        <li key={player.user_id} className="text-white">
                          {player.username} ({player.coins} coins)
                        </li>
                      ))}
                    </ul>
                  </div>
                  {isCreator && (
                    <Button
                      className="w-full mt-4 bg-yellow-600 hover:bg-yellow-700"
                      onClick={handleStartGame}
                      disabled={players.length < 3 || players.length > 8}
                    >
                      Start Game
                    </Button>
                  )}
                </div>
              )}

              <div className="mt-4 p-4 bg-casino-background rounded-lg">
                <p className="text-white">Player: {user?.username || user?.email}</p>
                <p className="text-white">Balance: {coins} coins</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}; 
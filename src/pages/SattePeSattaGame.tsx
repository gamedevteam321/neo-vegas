import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { GameBoard } from '@/components/games/SattePeSatta/GameBoard';

interface Player {
  user_id: string;
  username: string;
  coins: number;
  cards?: string[];
  score?: number;
}

interface Room {
  id: string;
  code: string;
  creator_id: string;
  entry_fee: number;
  status: 'waiting' | 'playing' | 'finished';
}

export const SattePeSattaGame: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [gameState, setGameState] = useState<'dealing' | 'playing' | 'finished'>('dealing');
  const [deck, setDeck] = useState<string[]>([]);
  const [currentTurn, setCurrentTurn] = useState<string | null>(null);
  const [playedCards, setPlayedCards] = useState<string[]>([]);

  useEffect(() => {
    if (!roomCode) return;

    // Subscribe to room updates
    const roomSubscription = supabase
      .channel(`room:${roomCode}`)
      .on('broadcast', { event: 'game_state_update' }, ({ payload }) => {
        try {
          console.log('Received game state update:', payload);
          if (!payload) return;

          // Transform received players data to match our Player interface
          const transformedPlayers = payload.players?.map((player: any) => ({
            user_id: player.user_id,
            username: player.username,
            coins: player.coins,
            cards: player.cards || [],
            score: player.score || 0
          })) || [];

          setGameState(payload.state);
          setCurrentTurn(payload.currentTurn);
          setPlayers(transformedPlayers);
          
          // Update current player from transformed data
          const updatedCurrentPlayer = transformedPlayers.find(p => p.user_id === user?.id);
          if (updatedCurrentPlayer) {
            setCurrentPlayer(updatedCurrentPlayer);
          }

          if (payload.playedCards) {
            setPlayedCards(payload.playedCards);
          }
        } catch (error) {
          console.error('Error processing game state update:', error);
        }
      })
      .subscribe();

    // Fetch initial room data
    const fetchRoomData = async () => {
      console.log('Fetching room data for code:', roomCode);
      try {
        const { data: roomData, error: roomError } = await supabase
          .from('rooms')
          .select('*')
          .eq('code', roomCode)
          .single()
          .throwOnError();

        if (roomError) throw roomError;

        console.log('Room data:', roomData);
        console.log('Current user:', user?.id);
        console.log('Is creator:', roomData.creator_id === user?.id);
        setRoom(roomData as unknown as Room);

        // Fetch all players in the room
        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select('user_id, username, coins')
          .eq('room_id', roomData.id)
          .throwOnError();

        if (playersError) throw playersError;

        // Transform the data with default values for missing columns
        const transformedPlayers = (playersData as any[]).map(player => ({
          user_id: player.user_id as string,
          username: player.username as string,
          coins: player.coins as number,
          cards: [],  // Initialize empty cards array
          score: 0   // Initialize score to 0
        }));

        console.log('Players data:', transformedPlayers);
        setPlayers(transformedPlayers);
        
        // Set current player from transformed data
        const currentPlayerData = transformedPlayers.find(p => p.user_id === user?.id);
        setCurrentPlayer(currentPlayerData || null);

      } catch (error) {
        console.error('Error fetching game data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch game data. Please try again.",
          variant: "destructive",
        });
        // Navigate back to home on error
        navigate('/');
      }
    };

    fetchRoomData();

    return () => {
      roomSubscription.unsubscribe();
    };
  }, [roomCode, user?.id, navigate]);

  // Initialize deck when game starts
  useEffect(() => {
    if (gameState === 'dealing' && room?.creator_id === user?.id) {
      const suits = ['♠', '♥', '♦', '♣'];
      const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
      const newDeck = suits.flatMap(suit => values.map(value => `${value}${suit}`));
      setDeck(newDeck);
    }
  }, [gameState, room?.creator_id, user?.id]);

  const dealCards = async () => {
    if (!room || !deck.length) return;

    const shuffledDeck = [...deck].sort(() => Math.random() - 0.5);
    const cardsPerPlayer = Math.floor(shuffledDeck.length / players.length);
    
    const updatedPlayers = players.map((player, index) => ({
      ...player,
      cards: shuffledDeck.slice(index * cardsPerPlayer, (index + 1) * cardsPerPlayer),
      score: 0
    }));

    try {
      // First update room status
      const { error: roomError } = await supabase
        .from('rooms')
        .update({ 
          status: 'playing',
          updated_at: new Date().toISOString()
        })
        .eq('id', room.id)
        .throwOnError();

      if (roomError) throw roomError;

      // Broadcast game state update
      await supabase
        .channel(`room:${roomCode}`)
        .send({
          type: 'broadcast',
          event: 'game_state_update',
          payload: {
            state: 'playing',
            currentTurn: players[0].user_id,
            players: updatedPlayers,
            playedCards: []
          }
        });

      // Update local state
      setPlayers(updatedPlayers);
      setCurrentPlayer(updatedPlayers.find(p => p.user_id === user?.id) || null);
      setGameState('playing');
      setCurrentTurn(players[0].user_id);
      setPlayedCards([]);

      toast({
        title: "Cards Dealt!",
        description: "The game has started. First player's turn.",
      });

    } catch (error) {
      console.error('Error in dealCards:', error);
      toast({
        title: "Error",
        description: "Failed to deal cards. Please try again.",
        variant: "destructive",
      });
    }
  };

  const playCard = async (cardIndex: number) => {
    if (!currentPlayer || currentTurn !== user?.id || !currentPlayer.cards) return;

    try {
      const card = currentPlayer.cards[cardIndex];
      const updatedCards = currentPlayer.cards.filter((_, i) => i !== cardIndex);
      const newPlayedCards = [...playedCards, card];

      // Update current player's state locally
      const updatedPlayers = players.map(p => 
        p.user_id === user?.id 
          ? { ...p, cards: updatedCards }
          : p
      );

      // Move to next player
      const currentIndex = players.findIndex(p => p.user_id === user.id);
      const nextIndex = (currentIndex + 1) % players.length;
      const nextPlayer = players[nextIndex].user_id;

      // Check if game is finished (all cards played)
      if (newPlayedCards.length === deck.length) {
        const { error: roomError } = await supabase
          .from('rooms')
          .update({
            status: 'finished',
            updated_at: new Date().toISOString()
          })
          .eq('id', room?.id)
          .throwOnError();

        if (roomError) throw roomError;

        // Calculate scores
        const scores = calculateScores(newPlayedCards, players);
        
        // Update local state with scores
        const playersWithScores = updatedPlayers.map(p => ({
          ...p,
          score: scores.find(s => s.user_id === p.user_id)?.score || 0
        }));

        setPlayers(playersWithScores);
      } else {
        setPlayers(updatedPlayers);
      }

      // Update current player's state
      setCurrentPlayer(prev => prev ? { ...prev, cards: updatedCards } : null);
      setPlayedCards(newPlayedCards);

      // Broadcast game state update
      await supabase
        .channel(`room:${roomCode}`)
        .send({
          type: 'broadcast',
          event: 'game_state_update',
          payload: {
            state: newPlayedCards.length === deck.length ? 'finished' : 'playing',
            currentTurn: nextPlayer,
            players: updatedPlayers,
            playedCards: newPlayedCards
          }
        });

    } catch (error) {
      console.error('Error in playCard:', error);
      toast({
        title: "Error",
        description: "Failed to play card. Please try again.",
        variant: "destructive",
      });
    }
  };

  const calculateScores = (playedCards: string[], players: Player[]) => {
    // Implement scoring logic here
    // For now, just return a simple score based on number of cards played
    return players.map(player => ({
      user_id: player.user_id,
      score: Math.floor(Math.random() * 100) // Placeholder scoring
    }));
  };

  const updatePlayerScores = async (scores: { user_id: string; score: number }[]) => {
    const { error } = await supabase
      .from('players')
      .upsert(scores.map(score => ({
        user_id: score.user_id,
        room_id: room?.id,
        score: score.score
      })));

    if (error) {
      console.error('Error updating player scores:', error);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-white mb-6">Satte Pe Satta</h1>
        {room && (
          <GameBoard
            players={players}
            currentTurn={currentTurn}
            gameState={gameState}
            onPlayCard={playCard}
            onDealCards={dealCards}
            isCreator={room.creator_id === user?.id}
            roomCode={roomCode || ''}
            currentPlayer={currentPlayer}
            playedCards={playedCards}
          />
        )}
      </div>
    </MainLayout>
  );
}; 
import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { v4 as uuidv4 } from 'uuid';
import AlertModal from "../components/AlertModal";
import GameResultModal from '../components/GameResultModal';
import GameStartIntroModal from "../components/GameStartIntroModal";
import { getFromStorage, setToStorage } from '../helper/localStorage';
import Router, { useRouter } from "next/router";
import AnimatePage from '../components/AnimatePage';
import TimerBar from "../components/TimerBar";
import useNoInitialEffect from "../helper/UseNoInitialEffect";
import SurrenderButton from '../components/SurrenderButton';

export default function Home() {

  const [onlinePlayers, setOnlinePlayers] = useState(0);
  const [locationKeys, setLocationKeys] = useState([]);

  const DEFAULT_MOVES = useRef(['', '', '', '', '', '', '', '', '']);
  const TIMER_SECS = 15.0;
  const [socket, setSocket] = useState(null);
  const [myRoom, setMyRoom] = useState('');
  const [myName, setMyName] = useState('me');
  const [oppName, setOppName] = useState('unknown');
  const [isHost, setIsHost] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [symbol, setSymbol] = useState('');
  const [moves, setMoves] = useState(DEFAULT_MOVES.current);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [isMatchDone, setIsMatchDone] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [timer, setTimer] = useState(TIMER_SECS);
  const [openIntroModal, setIntroModal] = useState(false);
  const [resultModalDesc, setResultModalDesc] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRematch, setIsRematch] = useState(false);
  const [openAlertModal, setOpenAlertModal] = useState(false);
  const mySetTimeout = useRef(setTimeout);
  const [enemyTimer, setEnemyTimer] = useState(TIMER_SECS);
  const [myRecords, setMyRecords] = useState({
    wins: 0,
    loses: 0,
    draws: 0,
    total: 0,
    winRate: 0
  });
  const [pauseMyInterval, setPauseMyInterval] = useState(false);
  const [matchScore, setMatchScore] = useState({
    me: 0, enemy: 0
  });
  const didMount = useRef(false);

  useEffect(() => {

    didMount.current = true;
    const getPlayerName = () => {
      if (typeof getFromStorage('player-name') === 'undefined' ||
        getFromStorage('player-name') === null ||
        getFromStorage('player-name') === '') {
        Router.push('/signin');
      } else {
        setMyName(getFromStorage('player-name'));
        const record = JSON.parse(getFromStorage('player-record'));
        setMyRecords(record);
      }
    }

    fetch('/api/socketio').finally(() => {
      const s = io();
      setSocket(s);
    });

    // Broadcast that you're opening a page.
    localStorage.openpages = Date.now();
    window.addEventListener('storage', function (e) {
      if (e.key == "openpages") {
        // Listen if anybody else is opening the same page!
        localStorage.page_available = Date.now();
      }
      if (e.key == "page_available") {
        Router.push('/admonition');
      }
    }, false);

    getPlayerName();
  }, []);



  // Move
  useEffect(() => {

    const callback = (d) => {
      setPauseMyInterval(false);
      setIsMyTurn(d.turn === symbol ? false : true);
      setMoves(d.moves);
    }

    if (socket) {
      socket.on('move', (d) => callback(d));
    }

    return () => {
      if (socket) {
        socket.off('move', (d) => callback(d));
      }
    }
  }, [socket, symbol]);


  // Join Room 
  useEffect(() => {

    const callback = (d) => {
      setMyRoom(d.room)
      setSymbol(d.isHost ? 'x' : 'circle');
      setIsMyTurn(d.isHost);
      if (!isRematch) {
        setOppName(d.name);
      }

      setIsHost(d.isHost);

      if (d.isHost) {
        setIsLoading(true);
        setIsReady(d.isReady);
      } else {
        setIsLoading(false);
        setIntroModal(true);
        mySetTimeout.current = setTimeout(() => {
          setIsReady(d.isReady);
          setIntroModal(false);
        }, 5000);
      }
    }

    if (socket) {
      socket.on('joined-room', (d) => callback(d));
    }

    return () => {
      if (socket) {
        socket.off('joined-room', (d) => callbackJoinedRoom(d));
      }
    }

  }, [socket, isRematch]);

  // For Game Ready Event
  useEffect(() => {
    const callback = (d) => {
      setPauseMyInterval(false)
      setIsLoading(false);

      setIntroModal(true);
      if (isRematch) {
        setTimer(TIMER_SECS);
        setIsRematch(false);
      } else {
        setOppName(d.name ? d.name : oppName);
      }
      mySetTimeout.current = setTimeout(() => {
        setIsReady(d.isReady);
        setIntroModal(false);
      }, 5000);
    }

    if (socket) {
      socket.on('game-ready', (d) => callback(d));
    }

    return () => {
      if (socket) {
        socket.off('game-ready', (d) => callback(d));
      }
    }
  }, [socket, isRematch, isLoading, oppName]);

  // For Times Up Event
  useEffect(() => {
    let myInterval = null;
    if (isReady && isMyTurn) {

      if (timer <= 0) {
        clearInterval(myInterval);
        socket.emit('times-up',
          { symbol: symbol, room: myRoom });

      } else {
        if (!pauseMyInterval) {
          myInterval = setInterval(() => {
            if (isMatchDone) {
              clearInterval(myInterval);
              // setTimer(TIMER_SECS);
            } else {
              const t = parseFloat((timer - 0.1).toFixed(4));
              setTimer(t);
              socket.emit('enemy-timer', {
                room: myRoom,
                timer: t
              });
            }

          }, 100);
        }

      }

    } else if (isReady && !isMyTurn) {
      // setTimer(TIMER_SECS);
    }

    return () => clearInterval(myInterval);
  }, [timer, isReady, isMyTurn, isMatchDone, myRoom, socket, symbol, pauseMyInterval])

  // Game Result Event
  useEffect(() => {
    const callback = (d) => {
      if (d.result === 'done' && symbol) {
        for (let i = 0; i < 9; i++) {
          const el = document.getElementById('cell' + i);
          el.classList.add('lose');

          for (let j = 0; j < d.combination.length; j++) {
            if (i === d.combination[j]) {
              el.classList.remove('lose');
            }


          }
        }

        setTimeout(() => {
          const iWin = d.winner == symbol ? true : false;
          setIsWin(iWin);
          if (iWin) {
            setMatchScore(prevState => ({
              me: prevState.me + 1,
              enemy: prevState.enemy
            }));
            setMyRecords(d => ({ ...d, wins: d.wins + 1 }));
          } else if (!iWin) {
            setMatchScore(prevState => ({
              me: prevState.me,
              enemy: prevState.enemy + 1
            }));
            setMyRecords(d => ({ ...d, loses: d.loses + 1 }));
          }
          setIsMatchDone(true);
        }, 200);

      } else if (d.result === 'draw') {
        setMyRecords(d => ({ ...d, draws: d.draws + 1 }));
        setTimeout(() => {
          setIsWin(null);
          setIsMatchDone(true);
        }, 200);
      } else if (d.result === 'timesup' && symbol) {

        const isWin = d.winner == symbol ? true : false
        if (isWin) {
          setMyRecords(d => ({ ...d, wins: d.wins + 1 }));
        } else {
          setMyRecords(d => ({ ...d, loses: d.loses + 1 }));
        }

        setTimeout(() => {
          setIsWin(isWin);
          setIsMatchDone(true);
        }, 200);
      }
    }

    if (socket) {
      socket.on('game-result', (d) => callback(d));
    }

    return () => {
      if (socket) {
        socket.off('game-result');
      }
    }

  }, [socket, symbol])

  // Disconnect Event
  useEffect(() => {
    const callback = () => {
      const m = [...moves];
      let movesMade = 0;
      for (let i = 0; i < m.length; i++) {

        if (m[i] !== '') {
          movesMade = movesMade + 1;
        }

        if (i === 8) {
          const desc = 'Your opponent is disconnected.';
          clearTimeout(mySetTimeout.current);
          setTimer(TIMER_SECS);
          setIntroModal(false);
          setIsReady(false);

          if (isMatchDone) {
            setIsMatchDone(false);
            setOpenAlertModal(true);
          } else {
            if (movesMade >= 3) {
              setIsWin(true);
              setIsMatchDone(true);
            } else {
              setIsWin(null);
              setIsMatchDone(true);
              // setOpenAlertModal(true);
            }
          }

        }
      }


    }

    if (socket) {
      socket.on('enemy-disconnect', callback);
    }

    return () => {
      if (socket) {
        socket.off('enemy-disconnect', callback);
        setResultModalDesc('');
      }
    }

  }, [socket, moves, isMatchDone, isWin, resultModalDesc]);

  // Opp wants rematch event
  useEffect(() => {

    const callback = () => {
      setIsRematch(true);
    }

    if (socket) {
      socket.on('rematch', () => callback());
    }

    return () => {
      if (socket) {
        socket.off('rematch');
      }
    }

  }, [socket, isRematch]);

  // Opp exit the match event
  useEffect(() => {
    const callback = () => {
      setIsMatchDone(false);
      // setIsReady(false);
      setPauseMyInterval(true);
      setIsWin(null);

      socket.emit('exit-room', { room: myRoom }, (res) => {
        if (res.status === 'ok') {
          setTimeout(() => {
            setOpenAlertModal(true);
          }, 500);
        }
      })

    }

    if (socket) {
      socket.on('exit-room', () => callback());
    }

    return () => {
      if (socket) {
        socket.off('exit-room', () => callback());
      }
    };

  }, [socket, openAlertModal, myRoom]);

  useEffect(() => {
    const callback = (d) => {
      setEnemyTimer(d.timer);
    }

    if (socket) {
      socket.emit('player-details', {
        id: getFromStorage('player-id'),
        name: getFromStorage('player-name'),
        type: 'initial'
      });
      socket.on('enemy-timer', (d) => callback(d));
    }

    return () => {
      if (socket) {
        socket.off('enemy-timer', (d) => callback(d));
      }
    }
  }, [socket]);

  useEffect(() => {

    const callback = (d) => {
      setOnlinePlayers(d.onlinePlayers);
      console.log('online')
    }

    if (socket) {
      socket.on('server-data', (d) => callback(d));
    }

    return () => {
      if (socket) {
        socket.off('server-data', (d) => callback(d));
      }
    }

  }, [socket]);

  useEffect(() => {
    const total = myRecords.wins + myRecords.loses + myRecords.draws;
    setMyRecords(d => ({
      ...d,
      total: total
    }));

    // setToStorage('player-record')


  }, [myRecords.wins, myRecords.loses, myRecords.draws])

  useNoInitialEffect(() => {
    setToStorage('player-record', JSON.stringify(myRecords));
  }, [myRecords]);


  const router = useRouter();
  useEffect(() => {
    router.beforePopState(({ as }) => {
      if (as !== router.asPath) {
        // Will run when leaving the current page; on back/forward actions
        // Add your logic here, like toggling the modal state
        if (isReady && !isMatchDone) {
          handleResultModalExit();
        } else if (isReady && isMatchDone) {
          handleResultModalExit();
        }
      }
      return true;
    });

    return () => {
      router.beforePopState(() => true);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, isReady, isMatchDone]);

  const handleJoinRoom = (isPlayAgain = false) => {
    if (socket.connected) {

      if (isPlayAgain) {
        setIsMatchDone(false);
        socket.emit('join-room', { id: socket.id, name: myName, room: myRoom });
      } else {
        socket.emit('join-room', { id: socket.id, name: myName, room: '' });
      }
    }
  }

  const handleCellClick = (i) => {
    setPauseMyInterval(true);
    let m = [...moves];
    if (m[i] === '') {
      setIsMyTurn(false);
      m[i] = symbol;
      setMoves(m);
      socket.emit('move', {
        room: myRoom,
        moves: m,
        turn: symbol
      });
    }

  }

  const handleResultModalExit = () => {
    clearTimeout(mySetTimeout.current);
    setIsReady(false);
    setIsMatchDone(false);
    setIsLoading(true);
    setMatchScore({
      me: 0, enemy: 0
    });
    socket.emit('exit-room', { room: myRoom }, (res) => {
      if (res.status === 'ok') {
        setEnemyTimer(TIMER_SECS);
        setMyRoom('');
        setIsHost(null);
        setMoves(DEFAULT_MOVES.current);
        // setOppName('');
        setSymbol('');
        setTimer(TIMER_SECS);
        setIntroModal(false);
        setResultModalDesc('');
        setIsWin(null);
        setIsLoading(false);
        setOpenAlertModal(false);
      }
    })
  }

  const handleResultModalPlayAgain = () => {
    if (resultModalDesc === '') {
      socket.emit('rematch',
        {
          room: myRoom,
          acceptRematch: isRematch
        }, (res) => {
          if (res.status === 'ok') {
            setTimer(TIMER_SECS);
            setEnemyTimer(TIMER_SECS);
            setIsMatchDone(false);
            setIsReady(false);
            setIsLoading(!isRematch ? true : false);
            setMoves(DEFAULT_MOVES.current);
            // setIsMyTurn(false);
            // setSymbol('');
          }
        });
    } else {
      if (isHost) {
        clearTimeout(mySetTimeout.current);
        setIsLoading(true);
        setIsReady(false);
        setMoves(DEFAULT_MOVES.current);
        setIsMatchDone(false);
        setEnemyTimer(TIMER_SECS);
        setTimer(TIMER_SECS);
        setIsWin(null);
        setIntroModal(false);
      } else {
        handleJoinRoom(true);
      }
    }

  }

  // Nueva función para salir y dar win al oponente
  // Elimino la función handleGiveWinAndExit


  return (
    <AnimatePage>
      <div className="app font-sans relative min-h-screen flex flex-col items-center justify-center bg-transparent">
        <GameStartIntroModal open={openIntroModal}></GameStartIntroModal>
        <GameResultModal clickExit={handleResultModalExit}
          clickPlayAgain={handleResultModalPlayAgain} modalDesc={resultModalDesc}
          open={isMatchDone} win={isWin}></GameResultModal>
        <AlertModal open={openAlertModal} clickExit={handleResultModalExit}></AlertModal>

        <div className="w-full max-w-3xl mx-auto p-4 flex flex-col gap-6">
          {isHost !== null && (
            <section className="flex flex-col items-center gap-2">
              <div className="flex justify-center w-full gap-8">
                <div className="flex items-center gap-2">
                  <div className="rounded text-xl w-10 h-10 bg-gray-700 bg-opacity-30 flex justify-center items-center font-semibold">{matchScore.me}</div>
                  <div className={`flex flex-col items-center ${isMyTurn ? '' : 'opacity-50'}`} style={{ minWidth: 100 }}>
                    <div className="flex items-center gap-2">
                      <div className={`symbol w-8 h-8 relative flex justify-center items-center ${symbol}`}></div>
                      <div className="time-container text-2xl flex items-center">{timer}</div>
                    </div>
                    <TimerBar timer={timer} matchDone={isMatchDone} secs={TIMER_SECS} start={(isReady && !isLoading && isMyTurn)} left={true} />
                    <div className="mt-1 text-xs text-gray-300 truncate max-w-[80px]">{myName}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`flex flex-col items-center ${!isMyTurn ? '' : 'opacity-50'}`} style={{ minWidth: 100 }}>
                    <div className="flex items-center gap-2">
                      <div className="time-container text-2xl flex items-center">{enemyTimer}</div>
                      <div className={`symbol w-8 h-8 relative flex justify-center items-center ${symbol === 'x' ? 'circle' : 'x'}`}></div>
                    </div>
                    <TimerBar timer={enemyTimer} matchDone={isMatchDone} secs={TIMER_SECS} start={(isReady && !isLoading && !isMyTurn)} left={false} />
                    <div className="mt-1 text-xs text-gray-300 truncate max-w-[80px] text-right">{oppName || ' - '}</div>
                  </div>
                  <div className="rounded text-xl w-10 h-10 bg-gray-700 bg-opacity-30 flex justify-center items-center font-semibold">{matchScore.enemy}</div>
                </div>
              </div>
            </section>
          )}

          {(!isReady && myRoom === '') && (
            <section className="flex flex-col md:flex-row gap-8 items-center justify-center w-full mt-8">
              <div className="flex flex-col w-full md:w-2/3 gap-4 items-center md:items-start">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Online Tictactoe</h1>
                <h2 className="text-2xl md:text-3xl font-light text-gray-300 mb-2">¡Hola, {myName}!</h2>
                <p className="text-base md:text-lg text-gray-400 max-w-md mb-4">La mejor experiencia y los mejores proyectos con <b>MaresDeveloper</b>.</p>
                <button disabled={!socket}
                  id="findMatchBtn"
                  className="transition bg-gray-800 hover:bg-gray-700 text-white rounded-full px-8 py-2 text-base font-medium shadow focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                  onClick={handleJoinRoom}>Buscar partida</button>
              </div>
              <div className="flex flex-col gap-4 w-full md:w-1/3">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-sm text-gray-300"><b>{onlinePlayers}</b> Jugadores en línea</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-800 rounded p-3 flex flex-col items-center">
                    <span className="text-xs text-gray-400">Partidas</span>
                    <span className="font-semibold text-lg text-white">{myRecords.total}</span>
                  </div>
                  <div className="bg-gray-800 rounded p-3 flex flex-col items-center">
                    <span className="text-xs text-gray-400">Win Rate</span>
                    <span className="font-semibold text-lg text-white">{(myRecords.total > 0 ? (myRecords.wins + 0.5 * myRecords.draws) / myRecords.total * 100 : 0).toFixed(2)}%</span>
                  </div>
                  <div className="bg-gray-800 rounded p-3 flex flex-col items-center">
                    <span className="text-xs text-gray-400">Empates</span>
                    <span className="font-semibold text-lg text-white">{myRecords.draws}</span>
                  </div>
                  <div className="bg-gray-800 rounded p-3 flex flex-col items-center">
                    <span className="text-xs text-gray-400">Derrotas</span>
                    <span className="font-semibold text-lg text-white">{myRecords.loses}</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {(isReady && !isLoading && myRoom !== '') && (
            <section className="flex flex-col items-center justify-center w-full mt-8 gap-4">
              <div className="flex justify-center items-center w-full">
                <div style={{ pointerEvents: (isMyTurn ? 'auto' : 'none') }}
                  className={`board ${isMyTurn ? symbol : ''} mx-auto`} id="board">
                  {moves.map((cell, i) => (
                    <div className={`cell ${cell}`}
                      onClick={() => handleCellClick(i)} data-cell
                      key={i + cell} index={i} id={`cell${i}`}> </div>
                  ))}
                </div>
              </div>
              <SurrenderButton
                socket={socket}
                myRoom={myRoom}
                symbol={symbol}
                onSurrender={() => {
                  setIsReady(false);
                  setIsMatchDone(true);
                }}
              />
            </section>
          )}

          {(!isReady && isLoading) && (
            <section className="flex flex-col items-center justify-center h-64">
              <div className="text-sm mb-2 text-gray-400">Esperando oponente...</div>
              <span className="loader"></span>
            </section>
          )}
        </div>
      </div>
    </AnimatePage>
  )
}

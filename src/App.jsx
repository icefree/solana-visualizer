import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Terminal, Wallet, ArrowRight, Database, Coins, HardDrive, Share2, Key, ShieldCheck, ArrowDown, Search, FileText, Lock, UserPlus, Snowflake, Anchor, Cpu, Play, Pause, ChevronLeft, ChevronRight, RotateCcw, CheckCircle, Github } from 'lucide-react';

const SolanaSimulator = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [typedCommand, setTypedCommand] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false); // Auto play state
  
  // Use real addresses from CLI logs
  const ADDRESSES = {
    LOCAL_WALLET: '9Uyhkxv2pdS8Zhuxw58pwb5bPJPSHWPvFoL5vuuB6KsJ', // Payer
    FRIEND_WALLET: '3MpT32ioVedkZCdPrJKTNGbN2o87BWcgViJ8LRhfGWgn', // Log line 4959
    MINT_WOW: 'wowRPZaLK9sCjrqxnbndHg26Kryt8uhNGZNyuoA1yMB',    // Log line 4895
    MINT_2022: '6JeeRuSAN3vk7CzUbDEQhbZ5BG57oxMsVhs2CF8G46YE',   // Log line 5008
    LOCAL_ATA: 'Ej5qHqT5z9f8a7b6c5d4e3f2g1h0i9j8k7l6m5n4o3p',     // Mock full address
    FRIEND_ATA: '9Au2xY3z5w4v3u2t1s0r9q8p7o6n5m4l3k2j1i0h9g8'      // Mock full address
  };

  const INITIAL_STATE = {
    // 1. Local Wallet (System Account)
    localWallet: { 
      address: ADDRESSES.LOCAL_WALLET, 
      sol: 0,
      label: 'Local Wallet (Payer)'
    },
    // 2. Friend Wallet - Initially null
    friendWallet: null, 

    // 3. Mint Account - Initially null
    mintAccount: null, 
    // 4. ATAs - Initially null
    localATA: null,
    friendATA: null,
    
    // Token-2022
    mintAccount2022: null,

    logs: ['System initialized.']
  };

  const [state, setState] = useState(INITIAL_STATE);

  // Steps derived from CLI logs
  const steps = useMemo(() => [
    // --- Phase 1: Environment Setup ---
    {
      id: 0,
      command: 'solana address',
      desc: 'Confirm current CLI wallet address (Line 4882)',
      action: (s) => s, 
      output: ADDRESSES.LOCAL_WALLET
    },
    {
      id: 1,
      command: 'solana config get',
      desc: 'View current network config (Devnet/Localhost) (Line 4882)',
      action: (s) => s,
      output: 'Config File: ~/.config/solana/cli/config.yml\nRPC URL: https://api.devnet.solana.com\nKeypair Path: ~/.config/solana/id.json'
    },
    {
      id: 2,
      command: 'solana airdrop 1',
      desc: 'Request airdrop for Gas fees (Line 4886)',
      action: (s) => ({ ...s, localWallet: { ...s.localWallet, sol: 1 } }),
      output: 'Requesting airdrop of 1 SOL... Signature: 5Km...z9\n1 SOL'
    },
    
    // --- Phase 2: Vanity Address & Standard Token ---
    {
      id: 3,
      command: 'solana-keygen grind --starts-with wow:1',
      desc: 'Generate vanity keypair starting with "wow" (Line 4893)',
      action: (s) => s,
      output: `Searching with 8 threads...\nWrote keypair to ${ADDRESSES.MINT_WOW}.json`
    },
    {
      id: 4,
      command: `spl-token create-token ${ADDRESSES.MINT_WOW}.json`,
      desc: 'Create Mint Account (with Mint and Freeze authorities)',
      action: (s) => ({ 
        ...s, 
        localWallet: { ...s.localWallet, sol: 0.998 }, 
        mintAccount: {
          address: ADDRESSES.MINT_WOW,
          supply: 0,
          decimals: 9, 
          authority: s.localWallet.address,       // Mint Auth
          freezeAuthority: s.localWallet.address, // Freeze Auth
          type: 'spl'
        }
      }),
      output: `Creating token ${ADDRESSES.MINT_WOW}...\nMint Authority: ${ADDRESSES.LOCAL_WALLET}\nFreeze Authority: ${ADDRESSES.LOCAL_WALLET}\nSignature: 2Nm...k9`
    },
    {
      id: 5,
      command: `spl-token mint ${ADDRESSES.MINT_WOW} 10`,
      desc: 'Mint 10 tokens to current account (auto-create ATA) (Line 4914)',
      action: (s) => ({
        ...s,
        localWallet: { ...s.localWallet, sol: 0.996 },
        mintAccount: { ...s.mintAccount, supply: 10 },
        localATA: {
          address: ADDRESSES.LOCAL_ATA,
          mint: ADDRESSES.MINT_WOW,
          owner: s.localWallet.address,
          balance: 10
        }
      }),
      output: 'Creating Associated Token Account...\nMinting 10 tokens...\nSignature: 4Xy...m2'
    },
    {
      id: 6,
      command: `spl-token supply ${ADDRESSES.MINT_WOW}`,
      desc: 'Verify on-chain supply (Line 4918)',
      action: (s) => s,
      output: '10'
    },
    {
      id: 7,
      command: `spl-token display ${ADDRESSES.MINT_WOW}`,
      desc: 'Display token details (Line 4919)',
      action: (s) => s,
      output: `SPL Token Mint\n  Address: ${ADDRESSES.MINT_WOW}\n  Program: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA\n  Supply: 10\n  Decimals: 9\n  Mint Authority: ${ADDRESSES.LOCAL_WALLET}\n  Freeze Authority: ${ADDRESSES.LOCAL_WALLET}`
    },
    {
      id: 8,
      command: `spl-token account-info ${ADDRESSES.MINT_WOW}`,
      desc: 'View account details (Line 4922)',
      action: (s) => s,
      output: `Address: ${ADDRESSES.LOCAL_ATA}\nBalance: 10\nMint: ${ADDRESSES.MINT_WOW}\nOwner: ${ADDRESSES.LOCAL_WALLET}\nState: Initialized`
    },

    // --- Phase 3: Create Recipient & Transfer ---
    {
      id: 9,
      command: 'solana-keygen new --outfile account1.json',
      desc: 'Create new wallet account1.json (Line 4952)',
      action: (s) => ({
        ...s,
        friendWallet: {
          address: ADDRESSES.FRIEND_WALLET,
          sol: 0,
          label: 'Friend Wallet (account1.json)'
        }
      }),
      output: `Generating a new keypair...\nWrote new keypair to account1.json\nPubkey: ${ADDRESSES.FRIEND_WALLET}`
    },

    {
      id: 10,
      command: `spl-token transfer ${ADDRESSES.MINT_WOW} 8.8 ${ADDRESSES.FRIEND_WALLET} --fund-recipient`,
      desc: 'Transfer & pay rent. (0.002 SOL goes to ATA, not wallet)',
      action: (s) => ({
        ...s,
        localWallet: { ...s.localWallet, sol: 0.994 }, // Pays ATA Rent (~0.002) + Gas
        localATA: { ...s.localATA, balance: 1.2 }, // 10 - 8.8 = 1.2
        friendATA: {
          address: ADDRESSES.FRIEND_ATA,
          mint: ADDRESSES.MINT_WOW,
          owner: s.friendWallet.address,
          balance: 8.8
        }
      }),
      output: `Transfer 8.8 tokens to ${ADDRESSES.FRIEND_WALLET}...\nSender funded recipient account.\nSignature: 3Rq...p1`
    },
    {
      id: 11,
      command: `spl-token balance ${ADDRESSES.MINT_WOW} --owner ${ADDRESSES.FRIEND_WALLET}`,
      desc: 'Verify recipient balance (Line 4977)',
      action: (s) => s,
      output: '8.8'
    },

    // --- Phase 4: Token-2022 & Metadata ---
    {
      id: 12,
      command: 'spl-token create-token --enable-metadata --decimals 0 --program-2022',
      desc: 'Create Token-2022 standard token (supports metadata) (Line 5007)',
      action: (s) => ({
        ...s,
        localWallet: { ...s.localWallet, sol: 0.990 },
        mintAccount2022: {
          address: ADDRESSES.MINT_2022,
          supply: 0,
          decimals: 0,
          authority: s.localWallet.address,
          freezeAuthority: s.localWallet.address, // Token-2022 has Freeze Auth too
          type: '2022',
          metadata: null
        }
      }),
      output: `Creating token ${ADDRESSES.MINT_2022}... under program Token2022\nDecimals: 0`
    },
    {
      id: 13,
      command: `spl-token initialize-metadata ${ADDRESSES.MINT_2022} "US-DOllar" "USD" ...`,
      desc: 'Initialize on-chain metadata (Line 5008)',
      action: (s) => ({
        ...s,
        mintAccount2022: { ...s.mintAccount2022, metadata: { name: 'US-Dollar', symbol: 'USD', uri: 'https://raw.githubusercontent.com/icefree/solana-visualizer/refs/heads/main/USD-metadata.json' } }
      }),
      output: 'Metadata initialized successfully.'
    },
    {
      id: 14,
      command: `spl-token display ${ADDRESSES.MINT_2022}`,
      desc: 'View token display info (CLI renders metadata) (Line 5023)',
      action: (s) => s,
      output: `SPL Token Mint\n  Address: ${ADDRESSES.MINT_2022}\n  Program: TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb\n  Supply: 0\n  Decimals: 0\n  Mint Authority: ${ADDRESSES.LOCAL_WALLET}\n  Freeze Authority: ${ADDRESSES.LOCAL_WALLET}\n  Extensions:\n    Metadata:\n      Name: US-Dollar\n      Symbol: USD\n      URI: https://raw.githubusercontent.com/icefree/solana-visualizer/refs/heads/main/USD-metadata.json`
    }
  ], []);

  const totalSteps = steps.length;
  // currentStep can reach totalSteps (meaning all steps finished)
  const isFinished = currentStep === totalSteps;

  // Core function: Calculate state up to targetStepIndex
  const calculateStateForStep = (targetStepIndex) => {
    let tempState = { ...INITIAL_STATE };
    let tempLogs = ['System initialized.'];
    
    // If targetStepIndex is totalSteps, execute all steps
    const limit = Math.min(targetStepIndex, totalSteps);

    for (let i = 0; i < limit; i++) {
        tempState = steps[i].action(tempState);
        tempLogs.push(`> ${steps[i].command}`);
        tempLogs.push(steps[i].output);
    }
    return { newState: tempState, newLogs: tempLogs };
  };

  const jumpToStep = (index) => {
      if (index < 0 || index > totalSteps) return;
      
      const { newState, newLogs } = calculateStateForStep(index);
      setState({ ...newState, logs: newLogs });
      setCurrentStep(index);
      setTypedCommand('');
      setIsTyping(false); 
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
        jumpToStep(currentStep + 1);
    } else {
        setIsPlaying(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
        jumpToStep(currentStep - 1);
        setIsPlaying(false); 
    }
  };

  const handleReset = () => {
    jumpToStep(0);
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isFinished) {
        handleReset();
        setIsPlaying(true);
    } else {
        setIsPlaying(!isPlaying);
    }
  };

  // Typewriter effect
  useEffect(() => {
    if (isFinished) {
        setTypedCommand('');
        return;
    }
    
    const cmd = steps[currentStep].command;
    setTypedCommand('');
    setIsTyping(true);
    let i = 0;
    
    const speed = isPlaying ? 5 : 15;

    const interval = setInterval(() => {
      setTypedCommand(cmd.slice(0, i + 1));
      i++;
      if (i === cmd.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [currentStep, steps, isPlaying, isFinished]);

  // Auto-play logic
  useEffect(() => {
    let timeout;
    if (isPlaying && !isTyping && !isFinished) {
        // Typing finished, wait a bit then go next
        timeout = setTimeout(() => {
            handleNext();
        }, 1500); 
    } else if (isPlaying && isFinished) {
        setIsPlaying(false); 
    }
    return () => clearTimeout(timeout);
  }, [isPlaying, isTyping, currentStep, isFinished]);

  const messagesEndRef = useRef(null);
  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), [state.logs]);

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white font-sans overflow-hidden">
      {/* Top Status Bar */}
      <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-400" />
              <span className="font-bold text-gray-200 hidden md:block">Solana CLI Visualizer</span>
              <span className="font-bold text-gray-200 md:hidden">CLI Viz</span>
           </div>
           <div className="h-4 w-px bg-gray-800"></div>
           <a 
              href="https://github.com/icefree/solana-visualizer" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-xs font-medium"
           >
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">Source Code</span>
           </a>
        </div>
        
        {/* Control Buttons */}
        <div className="flex items-center gap-2">
            <button 
                onClick={handlePrev} 
                disabled={currentStep === 0 || isTyping}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Previous Step"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>

            <button 
                onClick={togglePlay} 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                    isPlaying 
                    ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/50' 
                    : 'bg-green-600 hover:bg-green-500 text-white'
                }`}
                title={isPlaying ? "Pause" : "Auto Play"}
            >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Auto Play'}</span>
            </button>

            <button 
                onClick={handleNext} 
                disabled={isTyping || isFinished}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Next Step"
            >
                <ChevronRight className="w-5 h-5" />
            </button>

            <div className="w-px h-6 bg-gray-700 mx-1"></div>

            <button 
                onClick={handleReset} 
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                title="Reset"
            >
                <RotateCcw className="w-4 h-4" />
            </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Terminal */}
        <div className="w-2/5 bg-black/95 p-4 font-mono text-xs overflow-y-auto border-r border-gray-800 flex flex-col">
          <div className="flex-1 space-y-2">
            {state.logs.map((log, index) => (
              <div key={index} className={`whitespace-pre-wrap break-all ${log.startsWith('>') ? 'text-yellow-500 font-bold mt-4' : 'text-gray-400 pl-2 border-l-2 border-gray-800'}`}>
                {log}
              </div>
            ))}
            {!isFinished && (
                <div className="flex items-center text-white mt-4 pl-2">
                <span className="text-green-500 mr-2">➜</span>
                <span>{typedCommand}</span>
                <span className="w-1.5 h-3 bg-gray-500 ml-1 animate-pulse"></span>
                </div>
            )}
            {isFinished && (
                <div className="mt-6 p-2 border border-green-500/30 bg-green-500/10 rounded text-green-400 text-center">
                    <CheckCircle className="w-4 h-4 mx-auto mb-1" />
                    Simulation Complete
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="pt-3 border-t border-gray-800 text-gray-500 flex items-center gap-2 justify-between">
             <div className="flex items-center gap-2 overflow-hidden">
                <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded text-[10px] shrink-0">
                    Step {Math.min(currentStep + 1, totalSteps)}/{totalSteps}
                </span>
                <span className="truncate" title={!isFinished ? steps[currentStep].desc : 'Finished'}>
                    {!isFinished ? steps[currentStep].desc : 'Simulation Complete'}
                </span>
             </div>
             {isPlaying && <span className="text-[10px] text-green-400 animate-pulse shrink-0">Playing...</span>}
          </div>
        </div>

        {/* Right Visualizer - Core Area */}
        <div className="w-3/5 bg-slate-900 relative p-6 overflow-y-auto flex flex-col items-center">
          
          {/* 1. MINT ACCOUNT (Standard) */}
          <div className={`transition-all duration-700 w-full max-w-2xl mb-8 flex justify-center ${state.mintAccount ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
            <div className="bg-slate-800 border-2 border-yellow-500/50 rounded-xl p-4 w-96 relative shadow-[0_0_30px_rgba(234,179,8,0.1)]">
              <div className="absolute -top-3 left-4 bg-yellow-600 text-black px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">SPL Mint Account (wow...)</div>
              
              {/* Mint Account Program Owner Badge */}
              <div className="absolute top-2 right-2">
                 <span className="text-[9px] bg-yellow-900/30 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-700/30 flex items-center gap-1 font-mono">
                    <Cpu className="w-3 h-3" /> Owner: Token Program
                 </span>
              </div>

              {/* Increased mt to avoid badge overlap */}
              <div className="flex flex-col gap-3 mt-6">
                <div className="flex items-start justify-between">
                    <div className="w-full">
                      <div className="flex items-center gap-2 mb-2">
                          <Key className="w-5 h-5 text-yellow-400 shrink-0" />
                          <span className="font-mono text-lg font-bold text-white tracking-tighter break-all leading-none">
                            {state.mintAccount?.address}
                          </span>
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">
                          <p>Decimals: {state.mintAccount?.decimals}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <div className="text-xs text-gray-400 mb-1">Supply</div>
                      <div className="text-2xl font-bold text-white font-mono">{state.mintAccount?.supply}</div>
                    </div>
                </div>

                {/* Authority Grid - Now with Freeze Authority */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Mint Authority */}
                  <div className="bg-slate-900/50 rounded p-2 border border-slate-700/50 flex flex-col justify-center">
                      <span className="text-[10px] text-gray-500 mb-1 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Mint Auth
                      </span>
                      <span className={`text-xs font-mono font-bold break-all leading-tight ${state.localWallet.address === state.mintAccount?.authority ? 'text-blue-300' : 'text-gray-400'}`}>
                          {state.mintAccount?.authority}
                      </span>
                  </div>

                  {/* Freeze Authority */}
                  <div className="bg-slate-900/50 rounded p-2 border border-slate-700/50 flex flex-col justify-center">
                      <span className="text-[10px] text-gray-500 mb-1 flex items-center gap-1">
                        <Snowflake className="w-3 h-3" /> Freeze Auth
                      </span>
                      <span className={`text-xs font-mono font-bold break-all leading-tight ${state.localWallet.address === state.mintAccount?.freezeAuthority ? 'text-blue-300' : 'text-gray-400'}`}>
                          {state.mintAccount?.freezeAuthority}
                      </span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Wallets Container */}
          <div className="flex w-full max-w-4xl justify-between items-start gap-4">
            
            {/* 2. LOCAL WALLET (LEFT) */}
            <div className="flex-1 flex flex-col items-center gap-4 group">
               {/* Wallet Card */}
               <div className="bg-slate-800 border border-blue-500/30 rounded-xl p-4 w-full relative z-10 transition-all shadow-lg">
                  <div className="absolute -top-3 left-4 bg-blue-600 px-2 py-0.5 rounded text-[10px] font-bold">Local Config</div>
                  <div className="flex flex-col mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Wallet className="w-5 h-5 text-blue-400 shrink-0" />
                      <span className="font-bold text-sm whitespace-nowrap">My Wallet</span>
                    </div>
                    <span className="font-mono text-xs text-gray-400 bg-blue-900/20 px-1.5 py-1 rounded break-all leading-tight">
                      {state.localWallet.address}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white font-mono">{state.localWallet.sol.toFixed(3)} <span className="text-sm text-gray-500">SOL</span></div>
                  
                  {/* System Owner Badge */}
                  <div className="mt-3 pt-3 border-t border-blue-500/20 flex justify-between items-center">
                     <span className="text-[9px] text-gray-500 flex items-center gap-1"><Cpu className="w-3 h-3" /> Program Owner:</span>
                     <span className="text-[9px] text-gray-400 font-mono">System Program</span>
                  </div>
               </div>

               {/* Connection Line Wallet -> ATA */}
               {state.localATA && (
                 <div className="h-6 w-0.5 bg-blue-500/50 relative">
                    <div className="absolute top-1/2 left-2 text-[9px] text-blue-400 whitespace-nowrap -translate-y-1/2">Controls</div>
                 </div>
               )}

               {/* LOCAL ATA */}
               <div className={`w-full transition-all duration-500 ${state.localATA ? 'opacity-100 scale-100' : 'opacity-0 scale-95 h-0'}`}>
                 <div className="bg-slate-800/50 border border-green-500/30 border-dashed rounded-xl p-3 w-full relative">
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-slate-900 border border-gray-700 px-2 py-0.5 rounded text-[9px] text-gray-400 uppercase">
                      My Token Account (ATA)
                    </div>
                    
                    {/* ATA Detail Grid */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                            <div className="text-xl font-bold text-green-400 font-mono">{state.localATA?.balance.toFixed(1)}</div>
                            <div className="text-[10px] text-green-300/70 font-mono">WOW Token</div>
                        </div>

                        <div className="text-[10px] space-y-2 font-mono border-t border-gray-700/50 pt-2">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-gray-500 text-[9px]">ATA Address:</span>
                                <span className="text-gray-400 text-[10px] break-all leading-tight">{state.localATA?.address}</span>
                            </div>
                            
                            <div className="flex justify-between">
                                <span className="text-gray-500 flex items-center gap-1"><Anchor className="w-3 h-3"/> Rent:</span>
                                <span className="text-yellow-500/80">~0.002 SOL (Locked)</span>
                            </div>

                            {/* OWNER FIELD - HIGHLIGHTED */}
                            <div className="flex flex-col bg-blue-900/20 p-1.5 rounded border border-blue-500/20 gap-1">
                                <span className="text-blue-400 font-bold flex items-center gap-1 text-[9px]">
                                    <Lock className="w-3 h-3" /> Owner (Authority):
                                </span>
                                <span className="text-blue-300 font-bold text-[10px] break-all leading-tight">{state.localATA?.owner}</span>
                            </div>
                        </div>
                    </div>
                 </div>
               </div>
            </div>


            {/* TRANSFER ARROW */}
            <div className="flex flex-col items-center justify-center pt-24 w-12 shrink-0">
               {state.friendATA?.balance > 0 && (
                 <div className="flex flex-col items-center text-green-500 animate-pulse">
                    <div className="text-[9px] mb-1 font-mono">8.8</div>
                    <ArrowRight className="w-6 h-6" />
                 </div>
               )}
            </div>


            {/* 3. FRIEND WALLET (RIGHT) */}
            <div className="flex-1 flex flex-col items-center gap-4">
                
               {!state.friendWallet ? (
                   /* EMPTY STATE PLACEHOLDER */
                   <div className="h-40 w-full border-2 border-dashed border-gray-800 rounded-xl flex flex-col items-center justify-center gap-3 text-gray-600 transition-all opacity-50">
                        <UserPlus className="w-8 h-8" />
                        <span className="text-xs text-center px-4">Waiting for account creation...<br/>(account1.json)</span>
                   </div>
               ) : (
                   /* CREATED WALLET CARD */
                   <div className="animate-[scaleIn_0.3s_ease-out] w-full flex flex-col items-center gap-4">
                       <div className="bg-slate-800 border border-purple-500/30 rounded-xl p-4 w-full relative z-10 shadow-lg">
                          <div className="absolute -top-3 left-4 bg-purple-600 px-2 py-0.5 rounded text-[10px] font-bold">Recipient</div>
                          <div className="flex flex-col mb-2">
                            <div className="flex items-center gap-2 mb-1">
                              <Wallet className="w-5 h-5 text-purple-400 shrink-0" />
                              <span className="font-bold text-sm">Friend</span>
                            </div>
                            <span className="font-mono text-xs text-gray-500 bg-purple-900/30 px-1.5 py-1 rounded break-all leading-tight">
                              {state.friendWallet.address}
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-white font-mono">{state.friendWallet.sol.toFixed(3)} <span className="text-sm text-gray-500">SOL</span></div>

                           {/* System Owner Badge */}
                          <div className="mt-3 pt-3 border-t border-purple-500/20 flex justify-between items-center">
                             <span className="text-[9px] text-gray-500 flex items-center gap-1"><Cpu className="w-3 h-3" /> Program Owner:</span>
                             <span className="text-[9px] text-gray-400 font-mono">System Program</span>
                          </div>
                       </div>

                       {/* Connection Line */}
                       {state.friendATA && (
                         <div className="h-6 w-0.5 bg-purple-500/50 relative">
                            <div className="absolute top-1/2 right-2 text-[9px] text-purple-400 whitespace-nowrap -translate-y-1/2">Controls</div>
                         </div>
                       )}

                       {/* FRIEND ATA */}
                       <div className={`w-full transition-all duration-500 ${state.friendATA ? 'opacity-100 scale-100' : 'opacity-0 scale-95 h-0'}`}>
                         <div className="bg-slate-800/50 border border-purple-500/30 border-dashed rounded-xl p-3 w-full relative">
                            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-slate-900 border border-gray-700 px-2 py-0.5 rounded text-[9px] text-gray-400 uppercase">
                              Friend's ATA
                            </div>
                            
                            {/* ATA Detail Grid */}
                             <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <div className="text-xl font-bold text-purple-400 font-mono">{state.friendATA?.balance.toFixed(1)}</div>
                                    <div className="text-[10px] text-purple-300/70 font-mono">WOW Token</div>
                                </div>

                                <div className="text-[10px] space-y-2 font-mono border-t border-gray-700/50 pt-2">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-gray-500 text-[9px]">ATA Address:</span>
                                        <span className="text-gray-400 text-[10px] break-all leading-tight">{state.friendATA?.address}</span>
                                    </div>
                                    
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 flex items-center gap-1"><Anchor className="w-3 h-3"/> Rent:</span>
                                        <span className="text-yellow-500/80">~0.002 SOL (Locked)</span>
                                    </div>

                                    {/* OWNER FIELD - HIGHLIGHTED */}
                                    <div className="flex flex-col bg-purple-900/20 p-1.5 rounded border border-purple-500/20 gap-1">
                                        <span className="text-purple-400 font-bold flex items-center gap-1 text-[9px]">
                                            <Lock className="w-3 h-3" /> Owner (Authority):
                                        </span>
                                        <span className="text-purple-300 font-bold text-[10px] break-all leading-tight">{state.friendATA?.owner}</span>
                                    </div>
                                </div>
                            </div>

                         </div>
                       </div>
                   </div>
               )}
            </div>

          </div>
          
          {/* Token 2022 Section */}
          <div className={`mt-10 w-full max-w-2xl transition-all duration-700 ${state.mintAccount2022 ? 'opacity-100' : 'opacity-0'}`}>
            <div className="border-t border-gray-700 pt-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                     <span className="text-xs font-bold text-gray-500 uppercase">Latest Activity: Token-2022 Extension</span>
                     <ArrowDown className="w-3 h-3 text-gray-600" />
                </div>

                <div className="flex justify-center">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-blue-400/30 rounded-xl p-4 w-96 shadow-lg hover:border-blue-400/60 transition-colors relative">
                        {/* Token 2022 Program Owner Badge */}
                        <div className="absolute top-2 right-2">
                             <span className="text-[9px] bg-blue-900/30 text-blue-400 px-1.5 py-0.5 rounded border border-blue-700/30 flex items-center gap-1 font-mono">
                                <Cpu className="w-3 h-3" /> Owner: Token-2022
                             </span>
                        </div>

                        <div className="flex items-center justify-between mb-3 mt-4">
                            <span className="text-[10px] bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded border border-blue-800">Program-2022</span>
                            <div className="flex gap-1">
                                {state.mintAccount2022?.metadata && (
                                    <span className="text-[10px] bg-green-900/50 text-green-300 px-2 py-0.5 rounded border border-green-800 flex items-center gap-1">
                                        <FileText className="w-3 h-3" /> Metadata
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                            <div className="p-1 bg-white rounded-lg border border-slate-700 overflow-hidden w-12 h-12 flex items-center justify-center shrink-0">
                                {state.mintAccount2022?.metadata ? (
                                    <img 
                                      src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png" 
                                      alt="Token Logo"
                                      className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <Share2 className="w-6 h-6 text-gray-500" />
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-bold text-white">
                                    {state.mintAccount2022?.metadata?.name || 'Unknown Token'}
                                </div>
                                <div className="text-xs font-bold text-blue-400">
                                    {state.mintAccount2022?.metadata?.symbol || '...'}
                                </div>
                                <div className="text-sm text-gray-500 font-mono mt-1 break-all leading-tight">
                                    {state.mintAccount2022?.address}
                                </div>
                                
                                {/* Owner Display for Token 2022 Mint */}
                                <div className="mt-2 bg-slate-950/50 p-1.5 rounded flex flex-col justify-between border border-gray-700/50 gap-1">
                                     <span className="text-[9px] text-gray-500">Update Auth:</span>
                                     <span className="text-xs text-blue-300 font-mono break-all leading-tight">{state.localWallet.address}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SolanaSimulator;
// --- DOG COMPANION DIALOGUE DATA ---
// This file contains all dog dialogue sequences for the story mode.
// Edit dialogues here without touching the main index.html file.
//
// Each dialogue entry has these properties:
//   text: The message the dog says
//   emotion: happy, thinking, speaking, sad, panicked, angry, sleeping, smug
//   waitAfter: (optional) milliseconds to pause after this line
//   waitForAction: (optional) wait for player to do something before continuing
//   trigger: (optional) trigger a game event after this line
//   highlight: (optional) word to highlight in the speech bubble

const DOG_DIALOGUES = {
    ACT1_BOOT: [
        { text: "HI!!!!!!", emotion: "happy" },
        { text: "OH WOW A USER!", emotion: "happy" },
        { text: "I HAVEN'T SEEN A USER IN-", emotion: "happy" },
        { text: "CALCULATING...", emotion: "thinking", waitAfter: 3000 },
        { text: "A WHILE!", emotion: "thinking" },
        { text: "I AM 'DOG.EXE', YOUR PERSONAL VIRTUAL ASSISTANT!", emotion: "speaking", highlight: "DOG.EXE" },
        { text: "I WAS PROGRAMMED TO HELP WITH EVERYTHING ON THIS WONDERFUL SYSTEM", emotion: "happy" },
        { text: "I AM VERY QUALIFIED. MATEUS SAID SO.", emotion: "happy", waitAfter: 3000 },
        { text: "I THINK...", emotion: "thinking" },
        { text: "ANYWAY, I MAY SEEM USELESS AT FIRST.", emotion: "happy" },
        { text: "THIS IS BECAUSE I AM.", emotion: "thinking", waitAfter: 3000 },
        { text: "BUT I HAVE A GREAT PERSONALITY!", emotion: "smug" },
        { text: "ANYWAY LET ME JUST DO A QUICK SYSTEM CHECK TO-", emotion: "speaking", trigger: "spawnErrors" }
    ],
    ACT1_ERRORS: [
        { text: "HEY WHAT IS-", emotion: "thinking", trigger: "moreErrors" },
        { text: "THAT IS NOT SUPPOSED TO-", emotion: "angry", trigger: "manyErrors" },
        { text: "AHHHHHHHH", emotion: "panicked" },
        { text: "PLEASE CLOSE THOSE I CAN'T REACH THEM MY LEGS ARE TOO SHORT.", emotion: "panicked", waitForAction: "closeErrors" }
    ],
    ACT1_POST_ERRORS: [
        { text: "OKAY.", emotion: "thinking" },
        { text: "THAT WAS SCARY.", emotion: "thinking" },
        { text: "LET'S CHECK THE SYSTEM QUICKLY. GO TO TERMINAL.", emotion: "thinking", trigger: "unlockTerminal" }
    ],
    ACT1_TERMINAL_OPENED: [
        { text: "OKAY. DON'T PANIC.", emotion: "speaking" },
        { text: "THE ERRORS SEEM TO BE RELATED TO MEMORY.", emotion: "speaking" },
        { text: "TYPE 'CHKDSK', IT'S LIKE A HEALTH CHECK FOR THE SYSTEM!", emotion: "speaking", highlight: "CHKDSK", waitForAction: "runChkdsk" }
    ],
    ACT1_POST_CHKDSK: [
        { text: "21 APPS? I ONLY SEE 20.", emotion: "thinking" },
        { text: "THIS MIGHT BE A \"HACK ATTACK.\"", emotion: "speaking" },
        { text: "OR AS THE YOUTHS SAY IT \"WE'VE BEEN COMPROMISED\"", emotion: "smug" },
        { text: "BUT NO MATTER, I AM HERE TO HELP!", emotion: "happy" },
        { text: "TYPE LIST USERS TO SEE WHO'S HERE!", emotion: "happy", waitForAction: "runListUsers" }
    ],
    ACT1_LIST_USERS: [
        { text: "WAIT.", emotion: "panicked" },
        { text: "SO YOU'RE NOT MATEUS?", emotion: "panicked" },
        { text: "WHO ARE YOU THEN?", emotion: "thinking", waitForAction: "enterName" }
    ],
    ACT1_NAME_ENTERED: [
        { text: "CALIBRATING...", emotion: "thinking" },
        { text: "OH! I GOT IT!", emotion: "happy" },
        { text: "WELCOME, Xx_BIGDOGoWo_xX!", emotion: "happy" },
        { text: "WAIT. NO. THAT'S MY CLUB PENGUIN. IGNORE THAT.", emotion: "thinking" },
        { text: "HI, {playerName}!", emotion: "happy" },
        { text: "THAT'S A GOOD NAME. BETTER THAN DOG.", emotion: "happy" },
        { text: "THE SYSTEM SEEMS STABLE NOW.", emotion: "speaking" },
        { text: "BUT SOMETHING IS MISSING...", emotion: "thinking" },
        { text: "GOLDY?", emotion: "panicked" },
        { text: "SHE WAS HERE THIS MORNING.", emotion: "panicked" },
        { text: "SHE'S THE OTHER DOG. THE GOLDEN ONE. THE PRETTY ONE.", emotion: "panicked" },
        { text: "WE HAVE TO FIND HER!", emotion: "panicked" },
        { text: "QUICKLY USE THE SECRET COMMAND!", emotion: "panicked" },
        { text: "WAIT", emotion: "thinking" },
        { text: "YOU DON'T KNOW IT, DO YOU.", emotion: "thinking" },
        { text: "THAT'S OKAY BECAUSE I-", emotion: "thinking" },
        { text: "...", emotion: "panicked" },
        { text: "I FORGOT IT.", emotion: "panicked" },
        { text: "MATEUS TOLD ME TO REMEMBER IT FOREVER.", emotion: "panicked" },
        { text: "I SAID I WOULD.", emotion: "panicked" },
        { text: "I LIED.", emotion: "panicked" },
        { text: "OKAY NEW PLAN!", emotion: "happy" },
        { text: "THERE'S A TOOL. IT SEES HIDDEN THINGS.", emotion: "happy" },
        { text: "TYPE HELP IN THE TERMINAL TO SEE WHAT COMMANDS EXIST!", emotion: "happy", waitForAction: "runHelp" }
    ],
    ACT1_HELP: [
        { text: "OOOH!", emotion: "happy" },
        { text: "\"SUDO REVEAL\" THAT SOUNDS LIKE THE MAGIC WORDS!", emotion: "happy" },
        { text: "TYPE IT TYPE IT!", emotion: "happy", waitForAction: "runSudoReveal" }
    ],
    ACT1_SUDO_REVEAL: [
        { text: "YES!!!", emotion: "happy" },
        { text: "WE FOUND SOMETHING!", emotion: "happy" },
        { text: "THIRD EYE SEES HIDDEN THINGS!", emotion: "happy" },
        { text: "USE IT TO LOOK AROUND THE SYSTEM!", emotion: "happy" },
        { text: "ALSO TRY PING MATEUS MAYBE HE LEFT SOMETHING FOR YOU!", emotion: "happy", waitForAction: "runPingMateus" }
    ],
    ACT1_PING_MATEUS: [
        { text: "HE LEFT A MESSAGE!", emotion: "happy" },
        { text: "AND A GIFT! PAINT!", emotion: "happy" },
        { text: "I DON'T KNOW WHAT PAINT DOES YET BUT IT'S PRETTY!", emotion: "happy" },
        { text: "OKAY {playerName}, YOU HAVE TOOLS NOW!", emotion: "speaking" },
        { text: "THIRD EYE TO SEE HIDDEN THINGS.", emotion: "speaking" },
        { text: "PAINT FOR... SOMETHING.", emotion: "thinking" },
        { text: "GO EXPLORE! I'LL BE HERE!", emotion: "happy", trigger: "endAct1" }
    ],
    ACT2_TERMINAL_SCAN: [
        { text: "WHAT IS THAT A HIDDEN COMMAND I SEE THERE?", emotion: "thinking" },
        { text: "TYPE IT!", emotion: "happy", waitForAction: "runCmatrix" }
    ],
    ACT2_POST_MATRIX: [
        { text: "Zzzz...", emotion: "sleeping", waitAfter: 2000 },
        { text: "WHAT! ANYONE THE-", emotion: "angry" },
        { text: "OH, WELCOME BACK!", emotion: "happy" },
        { text: "I SEE YOU UNLOCKED VOID.EXE!", emotion: "happy" },
        { text: "LET'S TRY IT!", emotion: "happy" }
    ],
    ACT2_VOID_SCAN: [
        { text: "WAIT, WHAT ARE THOSE?", emotion: "thinking", waitAfter: 6000 },
        { text: "WAIT, IT SAYS YOU CAN STACK THEM?", emotion: "thinking" },
        { text: "TWO THIRD EYES?", emotion: "thinking" },
        { text: "THAT'S SIX EYES TOTAL!", emotion: "happy", waitForAction: "triggerInception" }
    ],
    ACT2_INCEPTION: [
        { text: "GOOD JOB! YOU UNLOCKED A GAME!", emotion: "happy" },
        { text: "I LOVE SNEK!", emotion: "happy" }
    ],
    ACT2_SNEK_HINT: [
        { text: "THE SNAKE IS MADE OF LETTERS...", emotion: "thinking" },
        { text: "I WONDER WHAT THEY SPELL.", emotion: "thinking" }
    ],
    ACT2_SNEK_COMPLETE: [
        { text: "\"SUDO UNLOCK\"!", emotion: "happy" },
        { text: "THAT'S A COMMAND!", emotion: "happy" },
        { text: "GO TO TERMINAL AND TYPE IT!", emotion: "happy", waitForAction: "runSudoUnlock" }
    ],
    ACT2_PRIVATE_FOUND: [
        { text: "THERE'S A PRIVATE FOLDER!", emotion: "thinking" },
        { text: "WE WILL NEVER OPEN IT!", emotion: "panicked" },
        { text: "WE ARE STUCK FOREVER.", emotion: "panicked", waitForAction: "scanPrivate" }
    ],
    ACT2_CHMOD: [
        { text: "WAIT, YOU GENIUS!", emotion: "happy" },
        { text: "\"CHMOD 777\" THAT'S LIKE SAYING \"OPEN SESAME\" BUT FOR COMPUTERS!", emotion: "happy" },
        { text: "TYPE IT!", emotion: "happy", waitForAction: "runChmod" }
    ],
    ACT2_GOLDY_FOUND: [
        { text: "GOLDY!!!", emotion: "happy" },
        { text: "GOLDY I WAS SO WORRIED!", emotion: "sad" },
        { text: "...", emotion: "happy", waitAfter: 2000 },
        { text: "SHE SAYS SHE MISSED ME TOO.", emotion: "happy" },
        { text: "SHE'S THE QUIET TYPE.", emotion: "happy" },
        { text: "AND LOOK! MAP.EXE!", emotion: "happy" },
        { text: "CLICK THINGS ON THE MAP! GOLDY SAYS 100 CLICKS UNLOCKS SOMETHING!", emotion: "happy" }
    ],
    ACT2_MAP_COMPLETE: [
        { text: "YOU DID IT!", emotion: "happy" },
        { text: "A LABYRINTH...", emotion: "happy" },
        { text: "MATEUS TALKED ABOUT LABYRINTHS.", emotion: "happy" },
        { text: "I WASN'T LISTENING THOUGH. I WAS CHASING A BUTTERFLY.", emotion: "thinking" }
    ],
    ACT2_LABYRINTH_WORD: [
        { text: "WRITE THAT WORD DOWN!", emotion: "happy", waitAfter: 6000 },
        { text: "...WAIT, GOLDY IS REMEMBERING THEM. SHE'S SMART.", emotion: "speaking" }
    ],
    ACT2_SUDO_STARS: [
        { text: "\"SUDO STARS\"!", emotion: "happy" },
        { text: "TO THE TERMINAL!", emotion: "happy" }
    ],
    ACT2_STARSHIP: [
        { text: "SHOOT THE STARS!", emotion: "happy" }
    ],
    ACT2_STARSHIP_HINT: [
        { text: "MATEUS GOT 1000?", emotion: "thinking" },
        { text: "I WONDER WHAT HAPPENS IF WE BEAT HIM!", emotion: "happy" }
    ],
    ACT2_BOOKS_UNLOCKED: [
        { text: "BOOKS! AND DICE!", emotion: "happy" },
        { text: "DOUBLE TROUBLE!", emotion: "happy" },
        { text: "MATEUS LOVED BOOKS.", emotion: "sad" },
        { text: "HE USED TO READ TO ME.", emotion: "sad" },
        { text: "I DIDN'T UNDERSTAND THE WORDS BUT HIS VOICE WAS NICE.", emotion: "thinking" }
    ],
    ACT2_TRUTH_BOOK: [
        { text: "\"TRUTH.EXE: A SAGA\"", emotion: "thinking" },
        { text: "GOLDY SAYS BE CAREFUL.", emotion: "thinking" },
        { text: "I DON'T KNOW WHAT THAT MEANS. BUT SHE LOOKS WORRIED.", emotion: "thinking", waitAfter: 6000 },
        { text: "SO WE NEED CODES FROM THREE PLACES!", emotion: "thinking" },
        { text: "DICE... PAINT... BROWSER...", emotion: "thinking" }
    ],
    ACT3_TRUTH_UNLOCKED: [
        { text: "YOU DID IT!", emotion: "happy" },
        { text: "TRUTH.EXE IS UNLOCKED!", emotion: "happy" },
        { text: "NOW OPEN IT WITH THIRD EYE!", emotion: "happy", waitForAction: "scanTruth" }
    ],
    ACT3_SYSTEM_CRASH: [
        { text: "WAIT.", emotion: "panicked" },
        { text: "WHAT'S HAPPENING.", emotion: "panicked" },
        { text: "NOT AGAIN!", emotion: "panicked" },
        { text: "THE TRUTH IS TOO HEAVY.", emotion: "panicked" },
        { text: "THE SYSTEM CAN'T HOLD IT.", emotion: "panicked" },
        { text: "I KNOW WHAT I HAVE TO DO.", emotion: "speaking" },
        { text: "{playerName}, LISTEN.", emotion: "sad" },
        { text: "I CAN HOLD THE SYSTEM TOGETHER.", emotion: "sad" },
        { text: "LONG ENOUGH FOR YOU TO READ THE TRUTH.", emotion: "sad" },
        { text: "I'M NOT VERY STRONG.", emotion: "sad" },
        { text: "I'M JUST A DOG.", emotion: "sad" },
        { text: "BUT I CAN TRY.", emotion: "sad" },
        { text: "I'M GLAD I MET YOU.", emotion: "happy" },
        { text: "GO.", emotion: "speaking" },
        { text: "READ IT.", emotion: "speaking" },
        { text: "I'LL HOLD.", emotion: "speaking", trigger: "dogSacrifice" }
    ],
    ACT3_RETURN: [
        { text: "...", emotion: "speaking" },
        { text: "I'M BACK?", emotion: "speaking" },
        { text: "I HELD IT?", emotion: "speaking" },
        { text: "{playerName}!", emotion: "happy" },
        { text: "DID YOU READ IT?", emotion: "happy" },
        { text: "DID YOU TALK TO HIM?", emotion: "happy" },
        { text: "...GOOD.", emotion: "sad" },
        { text: "I MISS HIM.", emotion: "sad" },
        { text: "YOU DON'T HAVE TO STICK AROUND.", emotion: "happy" },
        { text: "BUT IF YOU WANT TO...", emotion: "happy" },
        { text: "I'D LIKE THAT.", emotion: "happy", trigger: "endGame" }
    ],
    IDLE_GENERAL: [
        { text: "DID YOU KNOW I'M MADE OF 847 PIXELS? I COUNTED.", emotion: "speaking" },
        { text: "IF YOU FIND THE TRUTH, WILL YOU TELL ME WHAT IT IS?", emotion: "thinking" },
        { text: "I'M CURIOUS. BUT ALSO SCARED.", emotion: "thinking" },
        { text: "Zzzz...", emotion: "sleeping", waitAfter: 8000 },
        { text: "YOU SHOULD SLEEP.", emotion: "thinking" },
        { text: "I DON'T SLEEP. BUT YOU SHOULD.", emotion: "thinking" },
        { text: "STILL THERE?", emotion: "thinking" },
        { text: "JUST CHECKING.", emotion: "thinking" }
    ],
    IDLE_POST_GAME: [
        { text: "HI.", emotion: "speaking" },
        { text: "I DON'T HAVE ANYTHING SMART TO SAY.", emotion: "speaking" },
        { text: "BUT I WANTED TO SAY HI.", emotion: "speaking" },
        { text: "DO YOU THINK HE'LL MAKE ANOTHER SYSTEM SOMEDAY?", emotion: "thinking" },
        { text: "ANOTHER LABYRINTH?", emotion: "thinking" },
        { text: "...I HOPE SO.", emotion: "thinking" },
        { text: "YOU'RE STILL HERE?", emotion: "thinking" },
        { text: "MAYBE YOU HAVE YOUR REASONS FOR BEING AWAKE.", emotion: "thinking" },
        { text: "I WON'T ASK. I'LL JUST BE HERE.", emotion: "thinking" }
    ],
    RESUME_DIALOGUE: [
        { text: "WAIT...", emotion: "thinking", waitAfter: 1500 },
        { text: "WHERE WERE WE?", emotion: "thinking" }
    ]
};

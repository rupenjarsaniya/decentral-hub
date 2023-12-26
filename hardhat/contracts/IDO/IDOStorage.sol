// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract IDOStorage {
    address public factory;

    struct IDOInfo {
        address idoOwner;
        uint256 tokenTotalSupply;
        uint256 idoTokenPercent;
        uint256 minimumMemeTokens;
        uint256 minMemeTokenToParticipate;
    }

    struct Participant {
        uint256 memeTokensSent;
        uint256 totalClaimableIDOTokens;
        // uint256 participantCount;
        // bool isParticipating;
        // bool isClaimedMemeTokens;
    }

    struct Tokens {
        address idoToken;
        address memeToken;
    }

    struct IDOTimeInfo {
        uint256 idoStartTime;
        uint idoBFATime;
        uint256 idoEndTime;
        uint256 claimableTime;
    }

    Tokens public tokens;
    IDOInfo public idoInfo;
    IDOTimeInfo public idoTimeInfo;
    IDOState public idoState;

    uint256 public tokensLeft;
    uint256 public totalMemeTokensSent;
    uint256 public paticipatesPurchaseTime;
    uint256 public duration = 3 * 30 days * 24 hours * 60 minutes * 1000;
    bool public isInitialized;
    bool public isWithdrawable = false;

    mapping(address => Participant) public participants;
    mapping(address => mapping(uint256 => uint256)) public claimCounter;

    enum IDOState {
        NOT_STARTED,
        STARTED,
        CLAIMABLE,
        ENDED,
        CANCELLED,
        COMPLETED
    }

    event IDOInitialized(
        address indexed idoOwner,
        address indexed idoToken,
        uint256 tokensForSale,
        uint256 minimumMemeTokens,
        uint256 minMemeTokenToParticipate,
        uint256 idoStartTime,
        uint256 idoEndTime,
        uint256 claimableTime
    );

    event IDOStarted(address indexed idoOwner, uint256 timestamp);

    event IDOEnded(address indexed idoOwner, uint256 timestamp);

    event IDOTokensClaimed(
        address indexed participant,
        uint256 indexed idoTokensClaimed
    );

    event ParticipatedInIDO(
        address indexed participant,
        uint256 indexed memeTokensSent,
        uint256 indexed timestamp
    );

    event minMemeTokenUpdated(
        address indexed idoOwner,
        uint256 indexed minMemeTokenToParticipate
    );
}

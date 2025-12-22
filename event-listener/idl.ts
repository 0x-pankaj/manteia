export const idl = {
  "address": "HCvWBZpYDeiTMUaSmCRm5jP67M6wYV2NDBjAG4qdDLNE",
  "metadata": {
    "name": "manteia_contract",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "claim_and_commit",
      "discriminator": [
        120,
        213,
        50,
        89,
        149,
        69,
        89,
        123
      ],
      "accounts": [
        {
          "name": "proxy_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  120,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "magic_program",
          "address": "Magic11111111111111111111111111111111111111"
        },
        {
          "name": "magic_context",
          "writable": true,
          "address": "MagicContext1111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "commit_and_undelegate_account",
      "discriminator": [
        225,
        185,
        216,
        218,
        42,
        54,
        68,
        136
      ],
      "accounts": [
        {
          "name": "payer",
          "signer": true
        },
        {
          "name": "proxy_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  120,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "payer"
              }
            ]
          }
        },
        {
          "name": "magic_context"
        },
        {
          "name": "magic_program"
        }
      ],
      "args": []
    },
    {
      "name": "commit_state",
      "discriminator": [
        201,
        80,
        148,
        145,
        9,
        196,
        225,
        56
      ],
      "accounts": [
        {
          "name": "payer",
          "signer": true
        },
        {
          "name": "proxy_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  120,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "payer"
              }
            ]
          }
        },
        {
          "name": "magic_context"
        },
        {
          "name": "magic_program"
        }
      ],
      "args": []
    },
    {
      "name": "create_proxy_account",
      "discriminator": [
        118,
        223,
        139,
        177,
        68,
        102,
        132,
        205
      ],
      "accounts": [
        {
          "name": "proxy_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  120,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "delegate_proxy_account",
      "discriminator": [
        12,
        184,
        199,
        3,
        201,
        74,
        29,
        92
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "buffer_pda",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  117,
                  102,
                  102,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "pda"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                240,
                200,
                224,
                60,
                2,
                228,
                124,
                254,
                42,
                205,
                116,
                37,
                94,
                130,
                157,
                232,
                255,
                90,
                77,
                94,
                227,
                189,
                224,
                224,
                9,
                60,
                137,
                97,
                8,
                87,
                241,
                219
              ]
            }
          }
        },
        {
          "name": "delegation_record_pda",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  108,
                  101,
                  103,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "pda"
              }
            ],
            "program": {
              "kind": "account",
              "path": "delegation_program"
            }
          }
        },
        {
          "name": "delegation_metadata_pda",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  108,
                  101,
                  103,
                  97,
                  116,
                  105,
                  111,
                  110,
                  45,
                  109,
                  101,
                  116,
                  97,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "pda"
              }
            ],
            "program": {
              "kind": "account",
              "path": "delegation_program"
            }
          }
        },
        {
          "name": "pda",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  120,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "payer"
              }
            ]
          }
        },
        {
          "name": "owner_program",
          "address": "HCvWBZpYDeiTMUaSmCRm5jP67M6wYV2NDBjAG4qdDLNE"
        },
        {
          "name": "delegation_program",
          "address": "DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "deposit",
      "discriminator": [
        242,
        35,
        198,
        137,
        82,
        225,
        242,
        182
      ],
      "accounts": [
        {
          "name": "game_account",
          "docs": [
            "The global game account that holds all deposited SOL"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  97,
                  109,
                  101,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "proxy_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  120,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initialize_game_account",
      "discriminator": [
        27,
        63,
        89,
        12,
        212,
        206,
        254,
        42
      ],
      "accounts": [
        {
          "name": "game_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  97,
                  109,
                  101,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "place_bet",
      "discriminator": [
        222,
        62,
        67,
        220,
        63,
        166,
        126,
        33
      ],
      "accounts": [
        {
          "name": "proxy_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  120,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "target_price_range_start",
          "type": "u64"
        },
        {
          "name": "target_price_range_end",
          "type": "u64"
        },
        {
          "name": "prediction_start_time",
          "type": "i64"
        },
        {
          "name": "prediction_end_time",
          "type": "i64"
        },
        {
          "name": "payout_multiplier",
          "type": "u64"
        }
      ]
    },
    {
      "name": "process_undelegation",
      "discriminator": [
        196,
        28,
        41,
        206,
        48,
        37,
        51,
        167
      ],
      "accounts": [
        {
          "name": "base_account",
          "writable": true
        },
        {
          "name": "buffer"
        },
        {
          "name": "payer",
          "writable": true
        },
        {
          "name": "system_program"
        }
      ],
      "args": [
        {
          "name": "account_seeds",
          "type": {
            "vec": "bytes"
          }
        }
      ]
    },
    {
      "name": "resolve_bet",
      "discriminator": [
        137,
        132,
        33,
        97,
        48,
        208,
        30,
        159
      ],
      "accounts": [
        {
          "name": "proxy_account",
          "writable": true
        },
        {
          "name": "backend_authority",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "bet_id",
          "type": "u64"
        },
        {
          "name": "won",
          "type": "bool"
        },
        {
          "name": "payout_amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdraw",
      "discriminator": [
        183,
        18,
        70,
        156,
        148,
        109,
        161,
        34
      ],
      "accounts": [
        {
          "name": "game_account",
          "docs": [
            "The global game account that holds all deposited SOL"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  97,
                  109,
                  101,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "proxy_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  120,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "GameAccount",
      "discriminator": [
        168,
        26,
        58,
        96,
        13,
        208,
        230,
        188
      ]
    },
    {
      "name": "ProxyAccount",
      "discriminator": [
        237,
        249,
        146,
        57,
        177,
        244,
        114,
        83
      ]
    }
  ],
  "events": [
    {
      "name": "BetPlacedEvent",
      "discriminator": [
        218,
        76,
        236,
        147,
        222,
        135,
        81,
        43
      ]
    },
    {
      "name": "BetResolvedEvent",
      "discriminator": [
        220,
        254,
        33,
        71,
        89,
        122,
        39,
        213
      ]
    },
    {
      "name": "DepositEvent",
      "discriminator": [
        120,
        248,
        61,
        83,
        31,
        142,
        107,
        144
      ]
    },
    {
      "name": "WithdrawEvent",
      "discriminator": [
        22,
        9,
        133,
        26,
        160,
        44,
        71,
        192
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "ArithmeticOverflow",
      "msg": "Arithmetic overflow occurred"
    },
    {
      "code": 6001,
      "name": "Unauthorized",
      "msg": "Unauthorized access"
    },
    {
      "code": 6002,
      "name": "InsufficientBalance",
      "msg": "Insufficient balance to place bet"
    },
    {
      "code": 6003,
      "name": "BetAlreadyResolved",
      "msg": "Bet has already been resolved"
    },
    {
      "code": 6004,
      "name": "PredictionWindowNotEnded",
      "msg": "Prediction window has not ended yet"
    },
    {
      "code": 6005,
      "name": "TooManyActiveBets",
      "msg": "Too many active bets (max 10)"
    },
    {
      "code": 6006,
      "name": "BetNotActive",
      "msg": "Bet not found or not active"
    },
    {
      "code": 6007,
      "name": "InvalidTimeWindow",
      "msg": "Invalid time window configuration"
    },
    {
      "code": 6008,
      "name": "InvalidPriceRange",
      "msg": "Invalid price range configuration"
    },
    {
      "code": 6009,
      "name": "InvalidBetAmount",
      "msg": "Bet amount must be greater than zero"
    },
    {
      "code": 6010,
      "name": "NoUnclaimedBalance",
      "msg": "No unclaimed balance to claim"
    }
  ],
  "types": [
    {
      "name": "Bet",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bet_id",
            "type": "u64"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "target_price_range_start",
            "type": "u64"
          },
          {
            "name": "target_price_range_end",
            "type": "u64"
          },
          {
            "name": "prediction_start_time",
            "type": "i64"
          },
          {
            "name": "prediction_end_time",
            "type": "i64"
          },
          {
            "name": "placed_at",
            "type": "i64"
          },
          {
            "name": "resolved",
            "type": "bool"
          },
          {
            "name": "won",
            "type": "bool"
          },
          {
            "name": "active",
            "type": "bool"
          },
          {
            "name": "payout_multiplier",
            "type": "u64"
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                "u8",
                7
              ]
            }
          }
        ]
      }
    },
    {
      "name": "BetPlacedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "bet_id",
            "type": "u64"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "target_price_range_start",
            "type": "u64"
          },
          {
            "name": "target_price_range_end",
            "type": "u64"
          },
          {
            "name": "prediction_start_time",
            "type": "i64"
          },
          {
            "name": "prediction_end_time",
            "type": "i64"
          },
          {
            "name": "placed_at",
            "type": "i64"
          },
          {
            "name": "payout_multiplier",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "BetResolvedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "bet_id",
            "type": "u64"
          },
          {
            "name": "won",
            "type": "bool"
          },
          {
            "name": "bet_amount",
            "type": "u64"
          },
          {
            "name": "payout_amount",
            "type": "u64"
          },
          {
            "name": "resolved_at",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "DepositEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "new_balance",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "GameAccount",
      "docs": [
        "Global game account that holds all deposited SOL",
        "This centralizes fund management and enables future multi-token support"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "total_deposits",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "ProxyAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "balance",
            "type": "u64"
          },
          {
            "name": "unclaimed_balance",
            "type": "u64"
          },
          {
            "name": "total_bets_placed",
            "type": "u64"
          },
          {
            "name": "active_bet_count",
            "type": "u8"
          },
          {
            "name": "bets",
            "type": {
              "array": [
                {
                  "defined": {
                    "name": "Bet"
                  }
                },
                10
              ]
            }
          }
        ]
      }
    },
    {
      "name": "WithdrawEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "new_balance",
            "type": "u64"
          }
        ]
      }
    }
  ]
}
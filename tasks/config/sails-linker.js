/**
 * Autoinsert script tags (or other filebased tags) in an html file.
 *
 * ---------------------------------------------------------------
 *
 * Automatically inject <script> tags for javascript files and <link> tags
 * for css files.  Also automatically links an output file containing precompiled
 * templates using a <script> tag.
 *
 * For usage docs see:
 * 		https://github.com/Zolmeister/grunt-sails-linker
 *
 */
module.exports = function(grunt) {

	grunt.config.set('sails-linker', {
    devJsDashboard: {
      options: {
        startTag: '<!--DASHBOARD SCRIPTS-->',
        endTag: '<!--DASHBOARD SCRIPTS END-->',
        fileTmpl: '<script src="%s"></script>',
        appRoot: '.tmp/public',
        verifyExists: false
      },
      files: {
        '.tmp/public/**/*.html': require('../pipeline').jsFilesToInjectDashboard,
        'views/**/*.html': require('../pipeline').jsFilesToInjectDashboard,
        'views/**/*.ejs': require('../pipeline').jsFilesToInjectDashboard
      }
    },

    devJsDashboardRelative: {
      options: {
        startTag: '<!--DASHBOARD SCRIPTS-->',
        endTag: '<!--DASHBOARD SCRIPTS END-->',
        fileTmpl: '<script src="%s"></script>',
        appRoot: '.tmp/public',
        relative: true,
        verifyExists: false
      },
      files: {
        '.tmp/public/**/*.html': require('../pipeline').jsFilesToInjectDashboard,
        'views/**/*.html': require('../pipeline').jsFilesToInjectDashboard,
        'views/**/*.ejs': require('../pipeline').jsFilesToInjectDashboard
      }
    },
    devJsClientRoom: {
      options: {
        startTag: '<!--CLIENTROOM SCRIPTS-->',
        endTag: '<!--CLIENTROOM SCRIPTS END-->',
        fileTmpl: '<script src="%s"></script>',
        appRoot: '.tmp/public',
        verifyExists: false
      },
      files: {
        '.tmp/public/**/*.html': require('../pipeline').jsFilesToInjectClientRoom,
        'views/**/*.html': require('../pipeline').jsFilesToInjectClientRoom,
        'views/**/*.ejs': require('../pipeline').jsFilesToInjectClientRoom
      }
    },

    devJsClientRoomRelative: {
      options: {
        startTag: '<!--CLIENTROOM SCRIPTS-->',
        endTag: '<!--CLIENTROOM SCRIPTS END-->',
        fileTmpl: '<script src="%s"></script>',
        appRoot: '.tmp/public',
        relative: true,
        verifyExists: false
      },
      files: {
        '.tmp/public/**/*.html': require('../pipeline').jsFilesToInjectClientRoom,
        'views/**/*.html': require('../pipeline').jsFilesToInjectClientRoom,
        'views/**/*.ejs': require('../pipeline').jsFilesToInjectClientRoom
      }
    },
    prodJsDashboard: {
      options: {
        startTag: '<!--DASHBOARD SCRIPTS-->',
        endTag: '<!--DASHBOARD SCRIPTS END-->',
        fileTmpl: '<script src="%s"></script>',
        appRoot: '.tmp/public',
        verifyExists: false
      },
      files: {
        '.tmp/public/**/*.html': ['.tmp/public/min/app.dashboard.min.js'],
        'views/**/*.html': ['.tmp/public/min/app.dashboard.min.js'],
        'views/**/*.ejs': ['.tmp/public/min/app.dashboard.min.js']
      }
    },

    prodJsDashboardRelative: {
      options: {
        startTag: '<!--DASHBOARD SCRIPTS-->',
        endTag: '<!--DASHBOARD SCRIPTS END-->',
        fileTmpl: '<script src="%s"></script>',
        appRoot: '.tmp/public',
        relative: true,
        verifyExists: false
      },
      files: {
        '.tmp/public/**/*.html': ['.tmp/public/min/app.dashboard.min.js'],
        'views/**/*.html': ['.tmp/public/min/app.dashboard.min.js'],
        'views/**/*.ejs': ['.tmp/public/min/app.dashboard.min.js']
      }
    },
    prodJsClientRoom: {
      options: {
        startTag: '<!--CLIENTROOM SCRIPTS-->',
        endTag: '<!--CLIENTROOM SCRIPTS END-->',
        fileTmpl: '<script src="%s"></script>',
        appRoot: '.tmp/public',
        verifyExists: false
      },
      files: {
        '.tmp/public/**/*.html': ['.tmp/public/min/app.clientroom.min.js'],
        'views/**/*.html': ['.tmp/public/min/app.clientroom.min.js'],
        'views/**/*.ejs': ['.tmp/public/min/app.clientroom.min.js']
      }
    },

    prodJsClientRoomRelative: {
      options: {
        startTag: '<!--CLIENTROOM SCRIPTS-->',
        endTag: '<!--CLIENTROOM SCRIPTS END-->',
        fileTmpl: '<script src="%s"></script>',
        appRoot: '.tmp/public',
        relative: true,
        verifyExists: false
      },
      files: {
        '.tmp/public/**/*.html': ['.tmp/public/min/app.clientroom.min.js'],
        'views/**/*.html': ['.tmp/public/min/app.clientroom.min.js'],
        'views/**/*.ejs': ['.tmp/public/min/app.clientroom.min.js']
      }
    },

		devJs: {
			options: {
				startTag: '<!--SCRIPTS-->',
				endTag: '<!--SCRIPTS END-->',
				fileTmpl: '<script src="%s"></script>',
				appRoot: '.tmp/public'
			},
			files: {
				'.tmp/public/**/*.html': require('../pipeline').jsFilesToInject,
				'views/**/*.html': require('../pipeline').jsFilesToInject,
				'views/**/*.ejs': require('../pipeline').jsFilesToInject
			}
		},

		devJsRelative: {
			options: {
				startTag: '<!--SCRIPTS-->',
				endTag: '<!--SCRIPTS END-->',
				fileTmpl: '<script src="%s"></script>',
				appRoot: '.tmp/public',
				relative: true
			},
			files: {
				'.tmp/public/**/*.html': require('../pipeline').jsFilesToInject,
				'views/**/*.html': require('../pipeline').jsFilesToInject,
				'views/**/*.ejs': require('../pipeline').jsFilesToInject
			}
		},

		prodJs: {
			options: {
				startTag: '<!--SCRIPTS-->',
				endTag: '<!--SCRIPTS END-->',
				fileTmpl: '<script src="%s"></script>',
				appRoot: '.tmp/public'
			},
			files: {
				'.tmp/public/**/*.html': ['.tmp/public/min/production.min.js'],
				'views/**/*.html': ['.tmp/public/min/production.min.js'],
				'views/**/*.ejs': ['.tmp/public/min/production.min.js']
			}
		},

		prodJsRelative: {
			options: {
				startTag: '<!--SCRIPTS-->',
				endTag: '<!--SCRIPTS END-->',
				fileTmpl: '<script src="%s"></script>',
				appRoot: '.tmp/public',
				relative: true
			},
			files: {
				'.tmp/public/**/*.html': ['.tmp/public/min/production.min.js'],
				'views/**/*.html': ['.tmp/public/min/production.min.js'],
				'views/**/*.ejs': ['.tmp/public/min/production.min.js']
			}
		},

		devStyles: {
			options: {
				startTag: '<!--STYLES-->',
				endTag: '<!--STYLES END-->',
				fileTmpl: '<link rel="stylesheet" href="%s">',
				appRoot: '.tmp/public'
			},

			files: {
				'.tmp/public/**/*.html': require('../pipeline').cssFilesToInject,
				'views/**/*.html': require('../pipeline').cssFilesToInject,
				'views/**/*.ejs': require('../pipeline').cssFilesToInject
			}
		},

    devStylesDashboard: {
      options: {
        startTag: '<!--DASHBOARD STYLES-->',
        endTag: '<!--DASHBOARD STYLES END-->',
        fileTmpl: '<link rel="stylesheet" href="%s">',
        appRoot: '.tmp/public',
        verifyExists: false
      },
      files: {
        '.tmp/public/**/*.html': require('../pipeline').cssFilesToInjectDashboard,
        'views/**/*.html': require('../pipeline').cssFilesToInjectDashboard,
        'views/**/*.ejs': require('../pipeline').cssFilesToInjectDashboard
      }
    },

    devStylesClientRoom: {
      options: {
        startTag: '<!--CLIENTROOM STYLES-->',
        endTag: '<!--CLIENTROOM STYLES END-->',
        fileTmpl: '<link rel="stylesheet" href="%s">',
        appRoot: '.tmp/public',
        verifyExists: false
      },
      files: {
        '.tmp/public/**/*.html': require('../pipeline').cssFilesToInjectClientRoom,
        'views/**/*.html': require('../pipeline').cssFilesToInjectClientRoom,
        'views/**/*.ejs': require('../pipeline').cssFilesToInjectClientRoom
      }
    },

    devStylesEmbedDrawer: {
      options: {
        startTag: '<!--EMBED STYLES-->',
        endTag: '<!--EMBED STYLES END-->',
        fileTmpl: '<link rel="stylesheet" href="%s">',
        appRoot: '.tmp/public',
        verifyExists: false
      },
      files: {
        '.tmp/public/**/*.html': require('../pipeline').cssFilesToInjectEmbedDrawer,
        'views/**/*.html': require('../pipeline').cssFilesToInjectEmbedDrawer,
        'views/**/*.ejs': require('../pipeline').cssFilesToInjectEmbedDrawer
      }
    },

		devStylesRelative: {
			options: {
				startTag: '<!--STYLES-->',
				endTag: '<!--STYLES END-->',
				fileTmpl: '<link rel="stylesheet" href="%s">',
				appRoot: '.tmp/public',
				relative: true
			},

			files: {
				'.tmp/public/**/*.html': require('../pipeline').cssFilesToInject,
				'views/**/*.html': require('../pipeline').cssFilesToInject,
				'views/**/*.ejs': require('../pipeline').cssFilesToInject
			}
		},

		prodStyles: {
			options: {
				startTag: '<!--STYLES-->',
				endTag: '<!--STYLES END-->',
				fileTmpl: '<link rel="stylesheet" href="%s">',
				appRoot: '.tmp/public'
			},
			files: {
				'.tmp/public/index.html': ['.tmp/public/min/production.min.css'],
				'views/**/*.html': ['.tmp/public/min/production.min.css'],
				'views/**/*.ejs': ['.tmp/public/min/production.min.css']
			}
		},

		prodStylesRelative: {
			options: {
				startTag: '<!--STYLES-->',
				endTag: '<!--STYLES END-->',
				fileTmpl: '<link rel="stylesheet" href="%s">',
				appRoot: '.tmp/public',
				relative: true
			},
			files: {
				'.tmp/public/index.html': ['.tmp/public/min/production.min.css'],
				'views/**/*.html': ['.tmp/public/min/production.min.css'],
				'views/**/*.ejs': ['.tmp/public/min/production.min.css']
			}
		},

		prodStylesDashboard: {
			options: {
				startTag: '<!--DASHBOARD STYLES-->',
				endTag: '<!--DASHBOARD STYLES END-->',
				fileTmpl: '<link rel="stylesheet" href="%s">',
				appRoot: '.tmp/public',
				relative: false
			},
			files: {
				'.tmp/public/index.html': ['.tmp/public/min/app.dashboard.min.css'],
				'views/**/*.html': ['.tmp/public/min/app.dashboard.min.css'],
				'views/**/*.ejs': ['.tmp/public/min/app.dashboard.min.css']
			}
		},

		prodStylesClientRoom: {
			options: {
				startTag: '<!--CLIENTROOM STYLES-->',
				endTag: '<!--CLIENTROOM STYLES END-->',
				fileTmpl: '<link rel="stylesheet" href="%s">',
				appRoot: '.tmp/public',
				relative: false
			},
			files: {
				'.tmp/public/index.html': ['.tmp/public/min/app.clientroom.min.css'],
				'views/**/*.html': ['.tmp/public/min/app.clientroom.min.css'],
				'views/**/*.ejs': ['.tmp/public/min/app.clientroom.min.css']
			}
		},

		// Bring in JST template object
		devTpl: {
			options: {
				startTag: '<!--TEMPLATES-->',
				endTag: '<!--TEMPLATES END-->',
				fileTmpl: '<script type="text/javascript" src="%s"></script>',
				appRoot: '.tmp/public'
			},
			files: {
				'.tmp/public/index.html': ['.tmp/public/jst.js'],
				'views/**/*.html': ['.tmp/public/jst.js'],
				'views/**/*.ejs': ['.tmp/public/jst.js']
			}
		},

		devJsJade: {
			options: {
				startTag: '// SCRIPTS',
				endTag: '// SCRIPTS END',
				fileTmpl: 'script(src="%s")',
				appRoot: '.tmp/public'
			},
			files: {
				'views/**/*.jade': require('../pipeline').jsFilesToInject
			}
		},

		devJsRelativeJade: {
			options: {
				startTag: '// SCRIPTS',
				endTag: '// SCRIPTS END',
				fileTmpl: 'script(src="%s")',
				appRoot: '.tmp/public',
				relative: true
			},
			files: {
				'views/**/*.jade': require('../pipeline').jsFilesToInject
			}
		},

		prodJsJade: {
			options: {
				startTag: '// SCRIPTS',
				endTag: '// SCRIPTS END',
				fileTmpl: 'script(src="%s")',
				appRoot: '.tmp/public'
			},
			files: {
				'views/**/*.jade': ['.tmp/public/min/production.min.js']
			}
		},

		prodJsRelativeJade: {
			options: {
				startTag: '// SCRIPTS',
				endTag: '// SCRIPTS END',
				fileTmpl: 'script(src="%s")',
				appRoot: '.tmp/public',
				relative: true
			},
			files: {
				'views/**/*.jade': ['.tmp/public/min/production.min.js']
			}
		},

		devStylesJade: {
			options: {
				startTag: '// STYLES',
				endTag: '// STYLES END',
				fileTmpl: 'link(rel="stylesheet", href="%s")',
				appRoot: '.tmp/public'
			},

			files: {
				'views/**/*.jade': require('../pipeline').cssFilesToInject
			}
		},

		devStylesRelativeJade: {
			options: {
				startTag: '// STYLES',
				endTag: '// STYLES END',
				fileTmpl: 'link(rel="stylesheet", href="%s")',
				appRoot: '.tmp/public',
				relative: true
			},

			files: {
				'views/**/*.jade': require('../pipeline').cssFilesToInject
			}
		},

		prodStylesJade: {
			options: {
				startTag: '// STYLES',
				endTag: '// STYLES END',
				fileTmpl: 'link(rel="stylesheet", href="%s")',
				appRoot: '.tmp/public'
			},
			files: {
				'views/**/*.jade': ['.tmp/public/min/production.min.css']
			}
		},

		prodStylesRelativeJade: {
			options: {
				startTag: '// STYLES',
				endTag: '// STYLES END',
				fileTmpl: 'link(rel="stylesheet", href="%s")',
				appRoot: '.tmp/public',
				relative: true
			},
			files: {
				'views/**/*.jade': ['.tmp/public/min/production.min.css']
			}
		},

		// Bring in JST template object
		devTplJade: {
			options: {
				startTag: '// TEMPLATES',
				endTag: '// TEMPLATES END',
				fileTmpl: 'script(type="text/javascript", src="%s")',
				appRoot: '.tmp/public'
			},
			files: {
				'views/**/*.jade': ['.tmp/public/jst.js']
			}
		}
	});

	grunt.loadNpmTasks('grunt-sails-linker');
};

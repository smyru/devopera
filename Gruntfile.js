module.exports = function(grunt) {

	require('load-grunt-tasks')(grunt);
	require('time-grunt')(grunt);

	grunt.initConfig({
		sass: {
			task: {
				files: [{
					expand: true,
					cwd: 'styles',
					src: [
						'screen.scss',
						'search.scss'
					],
					dest: 'styles',
					ext: '.css'
				}]
			}
		},
		cssmin: {
			task: {
				files: [{
					expand: true,
					cwd: 'styles',
					src: '*.css',
					dest: 'styles'
				}]
			}
		},
		autoprefixer: {
			task: {
				src: 'styles/*.css'
			}
		},
		jekyll: {
			full: {
				//
			},
			limit: {
				options: {
					limit_posts: 150
				}
			}
		},
		htmlmin: {
			html: {
				options: {
					removeComments: true,
					collapseWhitespace: true
				},
				expand: true,
				cwd: '_site/',
				src: [
					'**/index.html',
					'errors/*.html'
				],
				dest: '_site/'
			},
			xml: {
				options: {
					collapseWhitespace: true,
					keepClosingSlash: true
				},
				expand: true,
				cwd: '_site/feed/',
				src: '**/index.xml',
				dest: '_site/feed/'
			}
		},
		beml: {
			options: {
				elemPrefix: '__',
				modPrefix: '--'
			},
			files: {
				expand: true,
				cwd: '_site/',
				src: [
					'**/index.html',
					'errors/*.html'
				],
				dest: '_site/'
			}
		},
		connect: {
			task: {
				options: {
					base: '_site',
					port: 33310,
					livereload: true,
					open: true
				}
			}
		},
		watch: {
			styles: {
				files: 'styles/*.scss',
				tasks: [
					'styles',
					'copy'
				]
			},
			limit: {
				files: [
					'**',

					'!.git/**',
					'!.sass-cache/**',

					'!_scripts/**',
					'!_site/**',

					'!CONTRIBUTING.md',
					'!LICENSE.md',
					'!README.md',

					'!Gruntfile.js',
					'!node_modules/**',
					'!package.json',
					'!install.sh',
					'!styles/*',

					'!{articles,blog,tv}/**',
						'{articles,blog,tv}/index.html',
						'{articles,blog,tv}/**/_posts/*.md'
				],
				tasks: [
					'jekyll:limit',
					'html'
				]
			},
			livereload: {
				options: {
					livereload: true
				},
				files: [
					'_site/**/*.html',
					'_site/styles/*.css'
				]
			}
		},
		copy: {
			task: {
				files: [{
					expand: true,
					src: 'styles/*.css',
					dest: '_site/'
				}]
			}
		},
		replace: {
			task: {
				src: '.htaccess',
				dest: '_site/',
				replacements: [{
					// Redirect all traffic to https://dev.opera.com/*
					from: 'RewriteEngine On\n\n',
					to: 'RewriteEngine On\n\nRewriteCond %{HTTP_HOST} !^dev\\.opera\\.com [NC]\nRewriteRule ^(.*)$ https://dev.opera.com%{REQUEST_URI} [R=301,L]\n\nRewriteCond %{HTTPS} off\nRewriteRule ^(.*)$ https://dev.opera.com%{REQUEST_URI} [R=301,L]\n\n'
				}]
			}
		},
		rsync: {
			options: {
				args: [
					'--checksum', // skip based on checksum, not mod-time & size
					'--chmod=ug=rwX,o=rX', // `chmod` new files
					'--compress', // compress data during the transfer
					// Note: the next line is commented out to avoid deleting the
					// `extension-docs` directory, which is generated from a separate
					// repository at the moment. As soon as the extension docs are merged
					// with the main `devopera` repository, we should re-enable it.
					//'--delete', // delete extraneous files on the receiving side
					'--human-readable', // output numbers in a human-readable format
					'--itemize-changes', // output a change-summary for all updates
					'--omit-dir-times', // …except for directories
					'--progress', // show progress during transfer
					'--stats', // show some file-transfer stats
					'--times', // preserve modification times…
					'--verbose' // increase verbosity
				],
				exclude: ['.DS_Store'],
				recursive: true
			},
			deploy: {
				options: {
					src: '_site/',
					dest: '/var/www/html/',
					host: '54.213.240.91'
				}
			}
		}
	});

	grunt.registerTask('styles', [
		'sass',
		'autoprefixer',
		'cssmin'
	]);

	grunt.registerTask('html', [
		'htmlmin',
		'beml'
	]);

	grunt.registerTask('default', [
		'styles',
		'jekyll:limit',
		'html',
		'connect',
		'watch'
	]);

	grunt.registerTask('build', [
		'styles',
		'jekyll:full',
		'html',
		'connect:task:keepalive'
	]);

	grunt.registerTask('deploy', [
		'replace',
		'rsync'
	]);

};

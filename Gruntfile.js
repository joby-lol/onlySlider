module.exports = function(grunt) {
	require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);
	grunt.initConfig({
		pkg:grunt.file.readJSON('package.json'),

		watch: {
			js: {
				files:['source/js/onlySlider.js'],
				tasks:['uglify']
			}
		},

		uglify: {
			options:{
				banner: '/*!\n<%=pkg.name%> <%=pkg.version%> (<%=grunt.template.today("yyyy-mm-dd")%>)\n<%=pkg.homepage%>\nLicense: <%=pkg.license%>\n\n<%=pkg.licenseText%>\n*/\n'
			},
			build: {
				files: {
					'onlySlider.min.js':['source/js/onlySlider.js']
				}
			}
		}

	});

	//default tasks
	grunt.registerTask('default',['uglify']);
}
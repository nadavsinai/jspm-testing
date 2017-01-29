const gulp = require('gulp'),
	conflict = require('gulp-conflict'),
	template = require('gulp-template'),
	path = require('path'),
	inquirer = require('inquirer'),
	_ = require('lodash'),
	fs = require('fs'),
	execS = require('child_process').execSync;

const defaults = {
	moduleNaturalName: process.argv[3] || 'htz-',
	get moduleSafeName() {
		return this.moduleNaturalName.replace(' ', '-');
	},
	moduleDescription: '',
	moduleAuthorName: execS('git config user.name', { encoding: 'utf8' }).split('\n')[0],
	moduleAuthorEmail: execS('git config user.email', { encoding: 'utf8' }).split('\n')[0]
};

// const textTransform =textTransformation(transformString);

gulp.task('default', function (done) {
	inquirer.prompt([
		{ type: 'input', name: 'moduleNaturalName', message: 'Give your module a name', default: defaults.moduleNaturalName },
		{ type: 'input', name: 'moduleDescription', message: 'Please describe what your module does', default: defaults.moduleDescription },
		{ type: 'confirm', name: 'typescript', message: 'Would you like to use typescript?', default: true },
		{ type: 'confirm', name: 'lint', message: 'Would you like to use eslint/tslint?', default: true },
		{ type: 'confirm', name: 'moveon', message: 'Continue?' }
	]).then(
		function (answers) {
			if (!answers.moveon) {
				return done();
			}
			delete (answers.moveon);
			let options = _.defaults(answers, defaults);
			const targetFolder = path.join(process.cwd(), options.moduleSafeName);
			gulp.src(__dirname + '/template/**', { dot: true })  // Note use of __dirname to be relative to generator
				.pipe(template(options))                 // Lodash template support
				.pipe(conflict(targetFolder))                    // Confirms overwrites on file conflicts
				.pipe(gulp.dest(targetFolder))                   // Without __dirname here = relative to cwd
				.on('end', function () {
					if (options.typescript) {
						fs.renameSync(path.join(targetFolder, 'src', 'index.js'), path.join(targetFolder, 'src', 'index.ts'));
					}
					else {
						//remove typescript related files
						fs.unlinkSync(path.join(targetFolder, 'src', 'custom.d.ts'));
						fs.unlinkSync(path.join(targetFolder, 'tsconfig.json'));
					}
					console.log('Running yarn install....');
					execS('yarn --ignore-scripts', { cwd: targetFolder });
					console.log('Instantiating a new git repository...');
					execS('git init ' + targetFolder);
					done();
				})
				.resume();
		});
});
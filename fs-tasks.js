const fs = require('fs')
const R = require('ramda')
const Task = require('data.task')

//TODO move slugify to another file
const slugify = R.compose(R.toLower, R.join('-'), R.split(' '))

// fileSlug :: {String originalname, *} -> Task {error, file} | {slug, *}
const fileSlug = file => 
	R.path(['originalname'], file) 
		? Task.of(
			R.assoc('slug', slugify(file.originalname), file)
		) 
		: Task.rejected({error: 'File no contiene la propiedad originalname, se recibió: ', file})


const writeFileWith = R.curry((fs, dir_path, file) => 
	new Task((reject, resolve) =>{
		return fs.writeFile(dir_path + file.filename, file.buffer, (err, res) =>
			err ? reject(err) : resolve(res)
		)
	})
)

const unlinkFile = path => 
	new Task((reject, resolve) =>
		fs.unlink(path, (err, res) =>
			err ? reject(err) : resolve(res)
		)
	)

const readToBuffer = path => 
	new Task((reject, resolve) => {
		return fs.readFile(path, (err, data) => 
			err ? reject(err) : resolve(data)
		)
	})

const readAsText = utf =>  path => 
	new Task((reject, resolve) => {
		return fs.readFile(path, utf, (err, data) => 
			err ? reject(err) : resolve(data)
		)
	})


// writeFile :: String dir_path -> {slug, buffer} -> Task err | fsWrite
const writeFile =  writeFileWith(fs)

module.exports = {
	slugify,
	fileSlug,
	writeFile,
	unlinkFile,
	readToBuffer
}
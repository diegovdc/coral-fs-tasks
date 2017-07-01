const fs = require('fs')
const expect = require("chai").expect
const R = require('ramda')
const Task = require('data.task')

const {writeFile, unlinkFile, readToBuffer} = require('../fs-tasks')


//TODO cambiar todo para usar sólo una conexión
describe('File system Tasks Library', () => {

	let file

	before((done) => { 
		readToBuffer(__dirname + '/fs-tasks-files/img1.jpg').fork(done, data => {
			file = data
			done()
		});
	});

	afterEach(done => {
		unlinkFile(__dirname + '/fs-tasks-files/dest/myfile.jpg').fork(e => {
			e.code === 'ENOENT' ? done() : console.log(e)
		}, s => done())
	});

	after(done => {
		done()
	});

	describe('readToBuffer :: String path -> Task err | Buffer', () => {
		it('reads a file and returns a Buffer', (done) => {
			readToBuffer(__dirname + '/fs-tasks-files/img1.jpg').fork(done, data => {
				expect(Buffer.isBuffer(data)).to.eql(true)
				done()
			});
		});
	});

	describe('writeFile :: String dir_path -> {filename, buffer} -> Task err | fsWrite', () => {
		//TODO after each delete file in dest
		it('saves a file into the given directory', (done) => {
			let path = __dirname + '/fs-tasks-files/dest/',
				filename = 'myfile.jpg'
			writeFile(path, {filename , buffer: file}).fork(done, 
				res => {
					readToBuffer(path+filename).fork(done, data => {
						expect(Buffer.isBuffer(data)).to.eql(true)
						done()
					})
				}
			)
		})
		it('composes', (done) => {
			let path = __dirname + '/fs-tasks-files/dest/',
				filename = 'myfile.jpg',
				writeAndRead = R.composeK(
					R.always(readToBuffer(path+filename)),//we use R.always because we do not care about what writeFile returns on success: undefined
					writeFile(path))
			
			writeAndRead({filename , buffer: file})
				.fork(done, data => {
					expect(Buffer.isBuffer(data)).to.eql(true)
					done()
				}
			)
		});
	})	

	describe('unlinkFile :: String path -> Task err | Void', () => {
		before((done) => {//create a File
			let path = __dirname + '/fs-tasks-files/dest/',
				filename = 'myfile.jpg'
			writeFile(path, {filename , buffer: file}).fork(done, 
				res => {
					readToBuffer(path+filename).fork(done, data => {
						expect(Buffer.isBuffer(data)).to.eql(true)
						done()
					})
				}
			)
		})
		it('deletes the file stated in the buffer', (done) => {
			unlinkFile(__dirname + '/fs-tasks-files/dest/myfile.jpg').fork(console.log,
				s => {
					readToBuffer(__dirname + '/fs-tasks-files/dest/myfile.jpg').fork(
						e => {
							expect(e.code).to.eql('ENOENT')//no such file or directory
							done()
						},
					done)
				}
			)
		});
	});

		
});

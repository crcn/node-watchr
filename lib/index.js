var EventEmitter = require('events').EventEmitter,
fs = require('fs'),
Structr = require('structr');


function eachAsync(target, callback) {
	
	var n = target.length;
	
	function next() {
		
		n--;
		callback(target[n], n);
		if(n) process.nextTick(next);
	}
	
	if(n) process.nextTick(next);
};


var Watchr = Structr({
	
	/**
	 */
	
	'__construct': function(ops) {
		
		this._em = new EventEmitter();
		
		//resolved path to given file
		this._path = ops.path;
		
		this._children = {}; 
		
		//files that are currently being watched - only *one* watcher
		this._watching = ops.watching;
		
		this.parent(ops.parent);
		
		this.init();
		
	},
	
	/**
	 */
	
	'on': function(event, callback) {
		
		this._em.addListener(event, callback);
	},
	
	/**
	 */
	
	'parent': function(value) {
		 
		if(value) {
			this._parent = value;
		}
		
		return this._parent;
	},
	
	
	/**
	 */
	
	'dispose': function() { 
		
		delete this._watching[this._path];
		fs.unwatchFile(this._path);
		
		if(this.isDirectory) {
			
			for(var file in this._children) {
				
				var watcher = this._watching[this._path + '/' + file];
				
				if(watcher) watcher.dispose();
			}
		}
	},
	
	
	/**
	 */
	
	
	'init': function() {
		
		var path = this._path,
		self = this;
		
		var stat = fs.statSync(path);                   
		  
		if(this.isDirectory = stat.isDirectory()) {
			 
			this._watchDirFiles(path, stat);
		}   
		
		fs.watchFile(path, { persistent: true, interval: 500 }, function(cur, prev) {
			if(cur.nlink != 0 && cur.mtime.getTime() == prev.mtime.getTime()) return;
			 
			if(cur.nlink == 0) self.dispose();
			
			self.change();
		});
	},  
	
	/**
	 */
	
	'change': function() {
		this._em.emit('change');
		
		if(this.parent()) {
			
			this.parent().change();
		} else {
			
			for(var path in this._watching) {
				
				var watcher = this._watching[path];
				
				if(!watcher.isDirectory) continue;
				  
				watcher._watchDirFiles();
			}
		}
		
	},
	
	/** 
	 */
	
	'_watchDirFiles': function() {
		
		var self = this, path = self._path;
		
		process.nextTick(function() {
			
			fs.readFile(path + '/.ignorewatch', 'utf8', function(err, content) { 
				var ignore = {};
				
				if(content != undefined) {
					
					var n = 0;
					
					content.split(/[\s\r\n\t]+/g).forEach(function(file) {
						
						if(!file.match(/\w+/g)) return;
						n++;
						
						ignore[file] = 1;
					})
					
					//nothing specified, or star
					if(!n || ignore['*']) return;	
				}
				
				fs.readdir(path, function(err, files) {

					if(err) return;

					files.forEach(function(file, i) {
						  
						if(file.substr(0,1) == '.' || ignore[file]) return;

						var filePath = path + '/' + file;

						self._children[file] = 1;

						Watchr.watch({ path: filePath, resolved: true, parent: self, watching: self._watching });
					});
				});	
			});
		});
	},
	
	/**
	 * called by user
	 */    
	
	'static watch': function(ops, callback) {
		
		if(!callback) callback = function() { };
		
		function onResolvedPath(err, resolvedPath) {
			
			var watcher = ops.watching[resolvedPath];
			                               
			if(watcher) {  
			// 	watcher.parent(ops.parent);
				return callback(false, watcher);
			}            
			
			callback(false, ops.watching[resolvedPath] = new Watchr(ops));
		}
			
		if(!ops.resolved) {
			
			fs.realpath(ops.path, onResolvedPath);
		} else {
			
			onResolvedPath(false, ops.path);
		}
	}
	
	
});


var watching = {};

module.exports = function(file, callback) {
	
	Watchr.watch({ path: file, watching: watching }, callback);
}
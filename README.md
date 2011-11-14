## Features

- recursively watch files
- **watch new dirs/files that have been added to any watched directory** 
- ability to ignore files with `.ignorewatch` including list of files to ignore (similar to `.gitignore`). Use `*` to ignore all files in `.ignorewatch` directory. 


````javascript 
  
var watch_r = require('watch_r');

watch_r('/path/to/file', function(watcher) {
	
	watcher.on('change', function() {
		//do stuff
	})
})

```` 


## Features

- recursively watch files
- **watch new dirs/files that have been added to any watched directory**
- ability to ignore directories with `.ignorewatch` file with list of files to ignore. No Specified files = ignore all in dir. 


````javascript
  
var watchr = require('watchr');


watchr('/path/to/file', function(watcher)
{
	watcher.on('change', function()
	{
		//do stuff
	})
})

```` 


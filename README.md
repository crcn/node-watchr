## Features

- recursively watch files
- **watch new dirs/files that have been added to any watched directory**


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
const fs = require('fs');

class Janitor
{
    constructor()
    {
        this.run();
    }

    async run()
    {
        try
        {
            await this.removeBuildDirectory();
            console.log('Cleanup complete, ready to run the compiler.');
        }
        catch (error)
        {
            console.log(error);
        }
    }

    removeBuildDirectory()
    {
        return new Promise((resolve, reject) => {
            fs.promises.access('build')
            .then(() => {
                fs.rmdir('build', { recursive: true }, (error) => {
                    if (error)
                    {
                        reject(error);
                    }

                    resolve();
                });
            })
            .catch(() => { resolve(); });
        });
    }
}

new Janitor();
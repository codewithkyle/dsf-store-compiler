const fs = require('fs');
const glob = require('glob');

class CustomCompiler
{
    constructor()
    {
        this.run();
    }

    async run()
    {
        try
        {
            const htmlFiles = await this.getHtmlFiles();
            if (htmlFiles.length === 0)
            {
                throw "Couldn't find any HTML files in the src/ directory";
            }

            await this.buildHtmlDirectories(htmlFiles);
            await this.cloneHtmlFiles(htmlFiles);
            console.log('Success!');
        }
        catch (error)
        {
            console.log(error);
        }
    }

    buildHtmlDirectories(files)
    {
        return new Promise((resolve, reject) => {
            let built = 0;
            for (let i = 0; i < files.length; i++)
            {
                const fullPath = files[i];
                console.log(fullPath);
                const cleanPathname = fullPath.replace(/(src\/)|(index\.html)/g, '').replace(/[\/]$/, '').trim().toLowerCase();
                console.log(cleanPathname);

                if (cleanPathname.length)
                {
                    fs.mkdir(`build/${ cleanPathname }`, { recursive: true }, (error) => {
                        if (error)
                        {
                            reject(error);
                        }
    
                        built++;
                        if (built === files.length)
                        {
                            resolve();
                        }
                    });
                }
                else
                {
                    built++;
                    if (built === files.length)
                    {
                        resolve();
                    }
                }
            }
        });
    }

    cloneHtmlFiles(files)
    {
        return new Promise((resolve, reject) => {
            let moved = 0;
            for (let i = 0; i < files.length; i++)
            {
                const fullPath = files[i];
                const cleanPathname = fullPath.replace(/(src\/)|(index\.html)/g, '').replace(/[\/]$/, '').trim().toLowerCase();

                fs.copyFile(fullPath, `build/${ cleanPathname }${ (cleanPathname.length) ? '/' : '' }index.html`, (error) => {
                    if (error)
                    {
                        reject(error);
                    }

                    moved++;
                    if (moved === files.length)
                    {
                        resolve();
                    }
                });
            }
        });
    }

    getHtmlFiles()
    {
        return new Promise((resolve, reject) => {
            glob('src/**/*.html', (error, files) => {
                if (error)
                {
                    reject(error);
                }

                resolve(files);
            });
        });
    }
}

new CustomCompiler();
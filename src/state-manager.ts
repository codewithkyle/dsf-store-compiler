interface ApplicationState
{
    compilerStatus: string,
    sourceCode: string,
}

declare var stateManager : StateManager;

class StateManager
{
    public state : ApplicationState;

    constructor()
    {
        this.state = {
            compilerStatus: 'disabled',
            sourceCode: '',
        };
    }

    public updateSourceCode(newSourceCode:string) : void
    {
        if (this.state.compilerStatus === 'running')
        {
            return;
        }

        const updatedState = { ...this.state };
        updatedState.sourceCode = newSourceCode;

        if (updatedState.sourceCode !== '')
        {
            updatedState.compilerStatus = 'enabled';
        }
        else
        {
            updatedState.compilerStatus = 'disabled';
        }

        this.updateState(updatedState);
    }

    private async generateDownloadLink(timestamp:string)
    {
        const request = await fetch(`temp/${ timestamp }/main.css`);
        if (request.ok)
        {
            const response = await request.blob();
            const fileUrl = URL.createObjectURL(response);
            const download = document.createElement('a');
            download.href = fileUrl;
            download.download = 'main.css';
            download.click();
            URL.revokeObjectURL(fileUrl);
            return;
        }

        throw `Failed to fetch file at temp/${ timestamp }/main.css`;
    }

    public compile() : void
    {
        if (this.state.compilerStatus === 'running' || this.state.compilerStatus === 'disabled')
        {
            console.error(`Compiler is ${ this.state.compilerStatus }`);
            return;
        }

        if (this.state.sourceCode === '')
        {
            console.error('Source code is required to run the compiler');
            return;
        }

        const updatedState = { ...this.state };
        updatedState.compilerStatus = 'running';
        this.updateState(updatedState);
        
        compiler.run(this.state.sourceCode)
        .then(timestamp => {
            this.generateDownloadLink(timestamp)
            .then(() => {
                const updatedState = { ...this.state };
                updatedState.compilerStatus = 'completed';
                this.updateState(updatedState);
            })
            .catch(error => {
                throw error;
            });
        })
        .catch(error => {
            console.error(error);
            const updatedState = { ...this.state };
            updatedState.compilerStatus = 'failed';
            this.updateState(updatedState);
        });
    }

    private updateState(newState:ApplicationState) : void
    {
        document.documentElement.setAttribute('state', newState.compilerStatus);
        this.state = newState;
    }
}

// @ts-ignore
self.stateManager = new StateManager();
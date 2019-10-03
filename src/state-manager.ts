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

    private notify() : void
    {
        const notice = new CustomEvent('state-change', { detail: { status: this.state.compilerStatus } });
        self.dispatchEvent(notice);
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
            const compilerButtonComponent:CompilerButtonComponent|null = document.body.querySelector('compiler-button-component');
            if (compilerButtonComponent)
            {
                compilerButtonComponent.addLink(fileUrl);
            }

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
        
        setTimeout(() => {
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
                alert(error);
            });
        }, 300);
    }

    private updateState(newState:ApplicationState) : void
    {
        document.documentElement.setAttribute('state', newState.compilerStatus);
        this.state = newState;
        this.notify();
    }
}

// @ts-ignore
self.stateManager = new StateManager();
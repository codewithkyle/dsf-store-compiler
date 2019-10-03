class CompilerButtonComponent extends HTMLElement
{
    private handleClickEvent:EventListener = this.runCompiler;

    private runCompiler() : void
    {
        stateManager.compile();
    }

    connectedCallback()
    {
        this.addEventListener('click', this.handleClickEvent);
    }
}
customElements.define('compiler-button-component', CompilerButtonComponent);
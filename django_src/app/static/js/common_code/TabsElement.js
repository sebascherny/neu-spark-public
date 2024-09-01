'use strict';

class TabsElement extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const showTab = (idx) => {
            for (var iterIdx = 0; iterIdx < this.props.tabButtons.length; iterIdx++) {
                document.getElementById(this.props.tabElements[iterIdx].elemId).style.display = "none";
                document.getElementById(this.props.tabButtons[iterIdx].elemId).className = document.getElementById(this.props.tabButtons[iterIdx].elemId).className.replace(" active", "");
            }
            document.getElementById(this.props.tabElements[idx].elemId).style.display = "block";
            document.getElementById(this.props.tabButtons[idx].elemId).className += " active";
        };
        return <div>

            <div className='tab'>
                {
                    this.props.tabButtons.map((btnObject, idx) =>
                        <button key={idx}
                            id={btnObject.elemId}
                            className={idx === 0 ? "tablinks active" : 'tablinks'}
                            onClick={() => {
                                showTab(idx);
                            }}>{btnObject.text}</button>
                    )
                }
            </div>
            <br />
            <div>
                {
                    this.props.tabElements.map((tabElement, idx) => <div
                        key={tabElement.elemId + '_' + idx}
                        id={tabElement.elemId}
                        className="tabcontent"
                        style={{ display: idx === 0 ? 'block' : 'none' }}
                    >
                        {tabElement.content}
                    </div>)
                }
            </div>
        </div>;
    }
}
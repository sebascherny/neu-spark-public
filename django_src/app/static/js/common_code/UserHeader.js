'use strict';

class UserHeader extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {

        const logout = async (e) => {
            await localStorage.removeItem("cisUserToken");
            await localStorage.removeItem("loggedInUsername");
            this.props.setLoggedInUsername(null);
            if (this.props.redirectWhenLoggedOut) {
                window.location.href = "/login";
            }
        };
        if (this.props.loggedInUsername == null) {
            return <div style={{
                display: "flex", flexDirection: "row"
            }} className="shadow container_div">
                <a className="btn btn-light" style={{ marginLeft: "auto" }} href={window.location.origin + "/login"}>Login</a>
            </div>
        }
        return <div className='container_div' style={{
            display: "flex", flexDirection: "row"
        }}>
            <a className={"btn btn-secondary "}
                style={{ backgroundColor: "#434575", borderColor: "#434575" }}
                href="/collections">My Collections</a>
            <a className={"btn btn-secondary "}
                style={{
                    backgroundColor: "#434575", borderColor: "#434575",
                    marginLeft: '20px'
                }}
                href="/new-collection">New Collection</a>
            <div style={{ marginLeft: "auto" }} >
                <a className={"btn btn-secondary " + "active"}
                    href="/profile" style={{ marginRight: "0.5em", backgroundColor: "#434575", borderColor: "#434575" }}>
                    {this.props.loggedInUsername}
                </a>
                <a className="btn btn-hover" style={{ marginLeft: "auto", border: "solid 1px" }} onClick={logout}>Logout</a>
            </div>
        </div>;
    }
}
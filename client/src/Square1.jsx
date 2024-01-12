
function Square1({black, children}){
    const bgcolor = (black ? "green" : "white");
    const color = (!black ? "white" : "green");
    return (
        <div
            style = {{
                width : "100%",
                height : "100%",
                backgroundColor : bgcolor,
            }}
        >
            {children}
        </div>
    );
}

export default Square1;
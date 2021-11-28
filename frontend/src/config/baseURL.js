let baseURL = "http://localhost:3001";
if (process.env.NODE_ENV === "production") {
    baseURL = "https://tic-tac-toe-wuzengfu.herokuapp.com/";
}

export { baseURL };

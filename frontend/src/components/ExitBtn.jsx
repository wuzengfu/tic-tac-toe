import React from 'react';

export const ExitBtn = () => {
    const handleExitBtn = () => {
        window.localStorage.clear();
        window.location.href = "/";
    }

    return (
        <button className={`btn btn-light px-4`} onClick={handleExitBtn} style={styles.btn}>Exit</button>
    );
};

const styles = {
    btn: {
        "&:hover": {
            backgroundColor: '#dcd7d7'
        }
    }
}

import React, { useState } from 'react';
import { Button } from 'react-bootstrap';

export const ExitBtn = () => {
    const [isHover, setIsHover] = useState(false);

    const handleExitBtn = () => {
        window.localStorage.clear();
        window.location.href = "/";
    }

    return (
        <Button
            variant={"light"}
            className={"px-4"}
            style={isHover ? styles.btnOnHover : null}
            onClick={handleExitBtn}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}>Exit</Button>
    );
};

const styles = {
    btnOnHover: {
        backgroundColor: 'rgb(236,231,231)'
    }
}

import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import {useHistory} from 'react-router-dom';

export const ExitBtn = () => {
    const [isHover, setIsHover] = useState(false);
    const history = useHistory();
    const handleExitBtn = () => {
        window.localStorage.clear();
        history.push("/");
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

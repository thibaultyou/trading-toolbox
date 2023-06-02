import React, { ReactNode, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useTickersContext } from './TickersContext';

interface LoadingButtonWrapperProps {
    children: ReactNode;
}

const LoadingButtonWrapper: React.FC<LoadingButtonWrapperProps> = ({
    children,
}) => {
    const [loading, setLoading] = useState(true);
    const { tickers } = useTickersContext();

    useEffect(() => {
        if (tickers.length) {
            setLoading(false);
        }
    }, [tickers]);

    return (
        <Box sx={{ mt: 2, mb: 1 }}>
            {loading ? (<LoadingButton loading={loading} size="large" />) : (<>{children}</>)}
        </Box>
    );
};

export default LoadingButtonWrapper;

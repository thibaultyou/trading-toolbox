import React from 'react';
import Page from '../components/molecules/Page';
import SetupsList from '../components/molecules/SetupsList';
import Title from '../components/atoms/Title';

const SetupsPage: React.FC = () => {
    return (
        <Page>
            <Title>Setups</Title>
            <SetupsList />
        </Page>
    );
};

export default SetupsPage;

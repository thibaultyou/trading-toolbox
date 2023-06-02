import React from 'react';
import Page from '../components/molecules/Page';
import SetupFormStepper from '../components/molecules/SetupFormStepper';
import Title from '../components/atoms/Title';

const HomePage: React.FC = () => {
    return (
        <Page>
            <Title>New setup</Title>
            <SetupFormStepper />
        </Page>
    );
};

export default HomePage;

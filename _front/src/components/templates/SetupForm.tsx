import React from 'react';
import AccountSelector from '../molecules/SetupForm/AccountSelector';
import RetriesSlider from '../molecules/SetupForm/SetupRetriesSlider';
import TickerSelector from '../molecules/SetupForm/TickerSelector';
import LoadingButtonWrapper from '../../containers/LoadingButtonWrapper';

const SetupForm: React.FC = () => {
  return (
    <>
      <AccountSelector />
      <LoadingButtonWrapper>
        <TickerSelector />
      </LoadingButtonWrapper>
      <RetriesSlider />
    </>
  );
};

export default SetupForm;

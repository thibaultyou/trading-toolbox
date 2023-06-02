import React from 'react';
import AccountSelector from '../molecules/AccountSelector';
import RetriesSlider from '../molecules/SetupRetriesSlider';
import TickerSelector from '../molecules/TickerSelector';
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

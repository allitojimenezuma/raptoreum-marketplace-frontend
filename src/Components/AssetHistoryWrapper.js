import React from 'react';
import { useParams } from 'react-router-dom';
import TransactionHistory from '../Pages/TransactionHistory';

const AssetHistoryWrapper = () => {
  const { id } = useParams();
  return <TransactionHistory assetId={id} />;
};

export default AssetHistoryWrapper;
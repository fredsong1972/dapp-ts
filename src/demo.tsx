import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import CssBaseline from '@mui/material/CssBaseline';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Slide from '@mui/material/Slide';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import AccountCircle from '@mui/icons-material/AccountCircle';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import { ethers } from "ethers";
import type { NFTCollectible, NFTCollectibleInterface } from './typechain-types/contracts/NFTCollectible';
import { NFTCollectible__factory } from './typechain-types/factories/contracts/NFTCollectible__factory'
import type { SignerWithAddress   } from "@nomiclabs/hardhat-ethers/signers"
import logo from './metamask.svg';

interface Props {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window?: () => Window;
  children: React.ReactElement;
}

interface IWallet {
    iconColor : string ;
    connectedWallet : string ;
    contractAddress: string;
    contractSymbol : string;
    contractBaseTokenURI : string;
}

const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
let provider : ethers.providers.Web3Provider;
let owner : SignerWithAddress;
let addrs : SignerWithAddress [];
let wallets : string [];

function HideOnScroll(props: Props) {
  const { children, window } = props;
  // Note that you normally won't need to set the window ref as useScrollTrigger
  // will default to window.
  // This is only being set here because the demo is in an iframe.
  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
  });

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

export default function HideAppBar(props: Props, ) {
   const [ state, setState ] = React.useState<IWallet>({
    iconColor : "disabled",
    connectedWallet : "",
    contractSymbol : "",
    contractAddress : "",
    contractBaseTokenURI : "",
  });

  const [nftCollection, setNFTCollection] = React.useState<string[]>([]);

  const connectWallet = async () => {
    try {
      console.log("connect wallet");
      const { ethereum } = window;
  
      if (!ethereum) {
        alert("Please install MetaMask!");
        return;
      }
  
      wallets = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected", wallets[0]);
     
      provider = new ethers.providers.Web3Provider(ethereum);
      const contract =  NFTCollectible__factory.connect(contractAddress, provider);
      const symbol = await contract.symbol();
      const baseTokenURI = await contract.baseTokenURI();
      setState({
        iconColor: "success",
        connectedWallet: wallets[0],
        contractSymbol: symbol,
        contractAddress: contract.address,
        contractBaseTokenURI : baseTokenURI
      });

      console.log("Connected", wallets[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const loadNFTCollection = async () => {
    try {
      console.log("load NFT collection");
      let baseURI : string = state.contractBaseTokenURI;
      baseURI = baseURI.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
      setNFTCollection(
        [
          `${baseURI}0001.svg`,
          `${baseURI}0002.svg`,
          `${baseURI}0003.svg`,
          `${baseURI}0004.svg`,
        ]);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <React.Fragment>
      <CssBaseline />
      <HideOnScroll {...props}>
        <AppBar>
          <Toolbar>
            <Stack direction="row" spacing={2}>
                <Typography variant="h3" component="div">
                NFT Collection
                </Typography>
                <Avatar alt="logo" src={logo} sx={{ width: 64, height: 64 }} />
            </Stack>
          </Toolbar>
        </AppBar>
      </HideOnScroll>
      <Toolbar />
      <Container>
        <Box>
          <Stack direction="row" spacing={2} sx={{ margin: 5 }}>
            <Button variant="contained" onClick={connectWallet}>Connect</Button>
            <Button variant="contained" disabled={!state.contractBaseTokenURI} onClick={loadNFTCollection}>Load NFT Collection</Button>
          </Stack>
          <Stack direction="column" spacing={10} sx={{ margin: 5 }}>
            <Stack direction="row" spacing={2} sx={{ margin: 5 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                <AccountCircle color={state.iconColor} sx={{ mr: 1, my: 0.5 }} />
                <TextField id="wallet_address" label="Connected Wallet" sx={{ width: 300 }} variant="standard" value={state.connectedWallet}
                  inputProps={{ readOnly: true, }}
                />
              </Box>
              <TextField id="contract_symbol" label="Contract Symbol" variant="standard" value={state.contractSymbol}
                inputProps={{ readOnly: true, }}
              />
              <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <TextField id="contract_address" label="Contract Address" sx={{ width: 400 }} variant="standard" value={state.contractAddress}
                inputProps={{ readOnly: true, }}
              />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                <TextField id="contract_baseURI" label="Contract Base Token URI" sx={{ width: 500 }} variant="standard" value={state.contractBaseTokenURI}
                  inputProps={{ readOnly: true, }}
                />
              </Box>
            </Stack>
            <ImageList sx={{ width: 500, height: 450 }} cols={3} rowHeight={164}>
              {nftCollection.map((item) => (
                <ImageListItem key={item}>
                  <img
                    src={`${item}?w=164&h=164&fit=crop&auto=format`}
                    srcSet={`${item}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                    loading="lazy"
                  />
                </ImageListItem>
              ))}
            </ImageList>
          </Stack>
        </Box>
      </Container>
    </React.Fragment>
  );
}

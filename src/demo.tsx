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
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Backdrop from '@mui/material/Backdrop';
import { BigNumber, ethers, providers } from "ethers";
import type { NFTCollectible, NFTCollectibleInterface } from './typechain-types/contracts/NFTCollectible';
import { NFTCollectible__factory } from './typechain-types/factories/contracts/NFTCollectible__factory'
import logo from './metamask.svg';

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};
interface Props {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window?: () => Window;
  children: React.ReactElement;
}

interface IWallet {
  iconColor: string;
  connectedWallet: string;
  contractAddress: string;
  contractSymbol: string;
  contractBaseTokenURI: string;
  contractOwnerAddress: string;
}

interface IService {
  account: string;
  ethProvider?: ethers.providers.Web3Provider,
  contract?: NFTCollectible;
  currentBalance: number;
  ethBalance: string;
  mintAmount: number;
}

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

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

export default function HideAppBar(props: Props,) {
  const [state, setState] = React.useState<IWallet>({
    iconColor: "disabled",
    connectedWallet: "",
    contractSymbol: "",
    contractAddress: "",
    contractBaseTokenURI: "",
    contractOwnerAddress: ""
  });

  const [nftCollection, setNFTCollection] = React.useState<string[]>([]);
  const [open, setOpen] = React.useState(false);
  const [openWithdrawal, setOpenWithdrawal] = React.useState(false);
  const [service, setService] = React.useState<IService>({
    account: "",
    currentBalance: 0,
    ethBalance: "",
    mintAmount: 0
  });
  
  const handleOpen = () => {
    setOpen(true);
    setService({...service, mintAmount: 0});
  }

  const handleClose = () => setOpen(false);

  const handleOpenWithdrawal = () => setOpenWithdrawal(true);
  
  const handleCloseWithdrawal = () => setOpenWithdrawal(false);

  const connectWallet = async () => {
    try {
      console.log("connect wallet");
      const { ethereum } = window;

      if (!ethereum) {
        alert("Please install MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected", accounts[0]);

      const provider = new ethers.providers.Web3Provider(ethereum);
      const contract = NFTCollectible__factory.connect(contractAddress, provider.getSigner());
      //const contract = new ethers.Contract(contractAddress, NFTCollectible__factory.abi, signer) as NFTCollectible;
      const ownerAddress = await contract.owner();
      const symbol = await contract.symbol();
      const baseTokenURI = await contract.baseTokenURI();
      const balance = await (await contract.balanceOf(accounts[0])).toNumber();
      const ethBalance = ethers.utils.formatEther(await provider.getBalance(accounts[0]));
      setState({
        iconColor: "success",
        connectedWallet: accounts[0],
        contractSymbol: symbol,
        contractAddress: contract.address,
        contractBaseTokenURI: baseTokenURI,
        contractOwnerAddress: ownerAddress
      });

      setService({
        account: accounts[0],
        contract: contract,
        currentBalance: balance,
        ethBalance: `${ethBalance} ETH`,
        mintAmount: 0,
        ethProvider: provider
      });

      console.log("Connected", accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const loadNFTCollection = async () => {
    try {
      console.log("load NFT collection");
      let baseURI: string = state.contractBaseTokenURI;
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

  const mintNFTs = async () => {
    try {
      console.log("mint NFTs");
      const address = service.account;
      const amount = service.mintAmount!;
      const contract = service.contract!;
      const price = await contract.PRICE();
      const ethValue = price.mul(BigNumber.from(amount));
      const signer = service.ethProvider!.getSigner();
      let txn = await contract.connect(signer!).mintNFTs(amount, { value: ethValue });
      await txn.wait();
      const balance = await contract.balanceOf(address);
      setService({...service, currentBalance: balance.toNumber(), mintAmount: 0});
    } catch (error) {
      console.log(error);
    }
  };

  const withdraw = async () => {
    try {
      console.log("owner withdraw");
      const contract = service.contract!;
      const provider = service.ethProvider!;
      let txn = await contract.withdraw();
      await txn.wait();
      const ethBalance = ethers.utils.formatEther(await provider!.getBalance(service.account));
      setService({...service, ethBalance: `${ethBalance} ETH`});
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
            <Button variant="contained" disabled={!state.contractBaseTokenURI} onClick={handleOpen}>Mint NFT</Button>
            <Button variant="contained" disabled={!state.contractOwnerAddress && state.contractOwnerAddress === service.account} onClick={handleOpenWithdrawal}>Withdrawal</Button>
          </Stack>
          <Stack direction="column" spacing={10} sx={{ margin: 5 }}>
            <Stack direction="row" spacing={2} sx={{ margin: 5 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                <AccountCircle color={state.iconColor} sx={{ mr: 1, my: 0.5 }} />
                <TextField id="wallet_address" label="Connected Account" sx={{ width: 300 }} variant="standard" value={state.connectedWallet}
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
        <div>
          <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            open={open}
            onClose={handleClose}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
              timeout: 500,
            }}
          >
            <Fade in={open}>
              <Box sx={modalStyle}>
                <Stack spacing={1} sx={{ width: 500 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                    <TextField id="mint_account" label="Account" sx={{ width: 500 }} variant="standard" value={service.account}
                      inputProps={{ readOnly: true}}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                    <TextField id="balance" label="Balance" sx={{ width: 500 }} variant="standard" value={service.currentBalance}
                      type = "number" inputProps={{ readOnly: true}}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                    <TextField id="mint_amount" type="number" label="Mint Amount" sx={{ width: 500 }} variant="standard" value={service.mintAmount}
                     onChange={event => {
                      const { value } = event.target;
                      const amount = parseInt(value); 
                      setService({...service, mintAmount: amount});
                    }}
                     />
                  </Box>
                  <Stack direction="row" spacing={2} sx={{ margin: 5 }}>
                    <Button variant="outlined" onClick={mintNFTs}>Mint</Button>
                    <Button variant="outlined" onClick={handleClose}>close</Button>
                  </Stack>
                </Stack>
              </Box>
            </Fade>
          </Modal>
        </div>
        <div>
          <Modal
            id="withdrawal_modal"
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            open={openWithdrawal}
            onClose={handleCloseWithdrawal}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
              timeout: 500,
            }}
          >
            <Fade in={openWithdrawal}>
              <Box sx={modalStyle}>
                <Stack spacing={1} sx={{ width: 500 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                    <TextField id="owner_account" label="Owner Account" sx={{ width: 500 }} variant="standard" value={service.account}
                      inputProps={{ readOnly: true}}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                    <TextField id="ethbalance" label="ETH Balance" sx={{ width: 500 }} variant="standard" value={service.ethBalance}
                      inputProps={{ readOnly: true}}
                    />
                  </Box>
                  <Stack direction="row" spacing={2} sx={{ margin: 5 }}>
                    <Button variant="outlined" onClick={withdraw}>Withdraw</Button>
                    <Button variant="outlined" onClick={handleCloseWithdrawal}>close</Button>
                  </Stack>
                </Stack>
              </Box>
            </Fade>
          </Modal>
        </div>
      </Container>
    </React.Fragment>
  );
}

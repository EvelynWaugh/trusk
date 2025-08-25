import styled from '@emotion/styled';
import { FormControl, IconButton, Box } from '@mui/material';

export const TaryfFormControl = styled(FormControl)`
  border-left: 1px solid #ddd;
  padding-left: 20px;
  margin-left: 20px;
`;

export const BoxTypo = styled.div`
  min-width: 150px;
`;

export const FormWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  & > *:not(:last-child) {
    margin-right: 20px;
  }
`;

export const FormWrapperVertical = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  & input {
    box-sizing: border-box;
  }
  & .trusk_date input {
    padding: 16.5px 14px;
    height: 55px;
  }
  & > * {
    margin-bottom: 20px;
  }
`;

export const IconButtonAdd = styled(IconButton)`
  background-color: rgb(25, 118, 210);
  :hover {
    background-color: rgb(21, 101, 192);
  }
  color: white;
`;

export const IconButtonAddDate = styled(IconButton)`
  background-color: rgb(25, 118, 210);
  :hover {
    background-color: rgb(21, 101, 192);
  }
  color: white;
  align-self: flex-start;
`;

export const TariffsContainer = styled(Box)`
  display: flex;
  & > div {
    flex: 1;
  }
`;

export const CharacteFormControl = styled(FormControl)`
  position: relative;
  margin-right: 10px;
  & .MuiButtonBase-root {
    visibility: hidden;
    opacity: 0;
    transition: all 0.3s ease;
    position: absolute;
    top: 0;
    right: 0;
    transform: translate(30%, -50%);
  }
  :hover .MuiButtonBase-root {
    visibility: visible;
    opacity: 1;
  }
`;

interface UploadContainerProps {
  isUpload: boolean;
}

export const UploadContainer = styled('div')<UploadContainerProps>`
  border: ${props =>
    props.isUpload ? '2px dashed #ddd' : '2px solid transparent'};
  display: block;
  float: left;
  margin: 0 10px 10px 0;
  width: ${props => (props.isUpload ? 'calc(15% - 10px)' : 'auto')};
  height: 120px;
  color: rgba(45, 45, 45, 0.21);
  background: transparent;
  position: relative;
  cursor: pointer;

  & .MuiSvgIcon-root {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    transition: all 0.3s ease;
  }

  & .delete-gallery {
    visibility: hidden;
    opacity: 0;
    transition: all 0.3s ease;
    position: absolute;
    top: 0;
    right: 0;
    width: 32px;
    height: 32px;
    background-color: #fff !important;
    box-shadow: -2px 3px 5px #666;
    transform: translate(30%, -50%);
  }

  & .add-text {
    visibility: hidden;
    opacity: 0;
    transition: all 0.3s ease;
    position: absolute;
    top: 0;
    left: 0;
    width: 32px;
    height: 32px;
    background-color: #fff !important;
    box-shadow: -2px 3px 5px #666;
    transform: translate(20%, -50%);
  }

  :hover .delete-gallery .MuiSvgIcon-root {
    color: #cc5a71;
  }

  :hover > .MuiSvgIcon-root {
    color: #cc5a71;
  }

  :hover .delete-gallery {
    visibility: visible;
    opacity: 1;
  }

  :hover .add-text {
    visibility: visible;
    opacity: 1;
  }
`;

export const RoomRowTable = styled.div<{ rows: number }>`
  display: grid;
  grid-template-columns: repeat(${props => props.rows}, 1fr);
  border-bottom: 1px solid #ddd;
  & > * {
    padding: 20px;
  }
  & > *:not(:last-child) {
    border-right: 1px solid #ddd;
  }
`;

export const RoomsInnerRows = styled.div`
  display: flex;
  align-items: center;
`;

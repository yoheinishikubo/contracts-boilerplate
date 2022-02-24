// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
pragma abicoder v2;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155SupplyUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/common/ERC2981Upgradeable.sol";

// import "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol";

contract ERC1155Sample is
    ERC1155BurnableUpgradeable,
    ERC1155SupplyUpgradeable,
    ERC2981Upgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable
{
    using SafeMathUpgradeable for uint256;
    using AddressUpgradeable for address;
    // using EnumerableSetUpgradeable for EnumerableSetUpgradeable.UintSet;
    // using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;

    string private _name;
    string private _symbol;
    uint256 private _nextId;

    struct Transfer {
        uint256 id;
        address to;
        uint256 amount;
    }

    event TransferedToRecipient(
        uint256 tokenId,
        uint256 transferId,
        address to,
        uint256 amount
    );

    function __ERC1155Sample_init(
        string memory name_,
        string memory symbol_,
        string memory uri_
    ) external initializer {
        _name = name_;
        _symbol = symbol_;
        __ERC1155_init(uri_);
        __Ownable_init_unchained();
        __ERC2981_init_unchained();
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC1155Upgradeable, ERC2981Upgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual override(ERC1155SupplyUpgradeable, ERC1155Upgradeable) {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

    function mint(
        address _account,
        uint256 _amount,
        uint96 _royaltyValue
    ) external onlyOwner {
        uint256 tokenId = _nextId;
        while (exists(tokenId)) {
            tokenId = tokenId.add(1);
        }
        _mint(_account, tokenId, _amount, "");
        if (_royaltyValue > 0) {
            _setTokenRoyalty(tokenId, _account, _royaltyValue);
        }
        _nextId = tokenId.add(1);
    }

    function transferToRecipients(
        uint256 tokenId,
        Transfer[] calldata _transfers
    ) external {
        require(
            balanceOf(_msgSender(), tokenId) >= _transfers.length,
            "ERC1155Sample: not enough tokens are owned."
        );
        address from = _msgSender();
        for (uint8 i = 0; i < _transfers.length; i++) {
            Transfer memory _transfer = _transfers[i];
            if (_transfer.to == address(0) || _msgSender() == _transfer.to) {
                continue;
            }
            if (_transfer.amount < 1) {
                continue;
            }
            safeTransferFrom(from, _transfer.to, tokenId, _transfer.amount, "");
            emit TransferedToRecipient(
                tokenId,
                _transfer.id,
                _transfer.to,
                _transfer.amount
            );
        }
    }

    function toHexDigit(uint8 d) internal pure returns (bytes1) {
        if (0 <= d && d <= 9) {
            return bytes1(uint8(bytes1("0")) + d);
        } else if (10 <= uint8(d) && uint8(d) <= 15) {
            return bytes1(uint8(bytes1("a")) + d - 10);
        }
        revert("ERC1155Sample: invalid value for hexadecimal.");
    }

    function nextIdForFilename() public view returns (string memory) {
        uint256 count = 0;
        uint256 a = _nextId;
        uint256 b = a;
        while (b != 0) {
            count++;
            b /= 16;
        }
        bytes memory res = new bytes(count);
        for (uint256 i = 0; i < count; ++i) {
            b = a % 16;
            res[count - i - 1] = toHexDigit(uint8(b));
            a /= 16;
        }
        bytes memory padded = new bytes(64);
        uint256 index = 0;
        for (uint256 i = 0; i < 64; ++i) {
            if (i < 64 - count) {
                padded[i] = bytes1("0");
            } else {
                padded[i] = res[index];
                ++index;
            }
        }
        return string(padded);
    }
}

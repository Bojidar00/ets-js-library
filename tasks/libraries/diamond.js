/* global ethers */

// get function selectors from ABI
export function getSelectors(contract) {
  const signatures = Object.keys(contract.interface.functions);

  const selectors = signatures.reduce((acc, val) => {
    if (val !== "init(bytes)") {
      // console.log(val, contract.interface.getSighash(val))
      acc.push(contract.interface.getSighash(val));
    }
    return acc;
  }, []);
  selectors.contract = contract;
  selectors.remove = remove;
  selectors.get = get;
  return selectors;
}

// get function selector from function signature
export function getSelector(func) {
  const abiInterface = new ethers.utils.Interface([func]);
  return abiInterface.getSighash(ethers.utils.Fragment.from(func));
}

// used with getSelectors to remove selectors from an array of selectors
// functionNames argument is an array of function signatures
export function remove(functionNames) {
  const selectors = this.filter((v) => {
    for (const functionName of functionNames) {
      if (v === this.contract.interface.getSighash(functionName)) {
        return false;
      }
    }
    return true;
  });
  selectors.contract = this.contract;
  selectors.remove = this.remove;
  selectors.get = this.get;
  return selectors;
}

// used with getSelectors to get selectors from an array of selectors
// functionNames argument is an array of function signatures
export function get(functionNames) {
  const selectors = this.filter((v) => {
    for (const functionName of functionNames) {
      if (v === this.contract.interface.getSighash(functionName)) {
        return true;
      }
    }
    return false;
  });
  selectors.contract = this.contract;
  selectors.remove = this.remove;
  selectors.get = this.get;
  return selectors;
}

// remove selectors using an array of signatures
export function removeSelectors(selectors, signatures) {
  const iface = new ethers.utils.Interface(signatures.map((v) => "function " + v));
  const removeSelectors = signatures.map((v) => iface.getSighash(v));
  selectors = selectors.filter((v) => !removeSelectors.includes(v));
  return selectors;
}

// find a particular address position in the return value of diamondLoupeFacet.facets()
export function findAddressPositionInFacets(facetAddress, facets) {
  for (let i = 0; i < facets.length; i++) {
    if (facets[i].facetAddress === facetAddress) {
      return i;
    }
  }
}

// exports.getSelectors = getSelectors;
// exports.getSelector = getSelector;
// exports.FacetCutAction = FacetCutAction;
// exports.remove = remove;
// exports.removeSelectors = removeSelectors;
// exports.findAddressPositionInFacets = findAddressPositionInFacets;
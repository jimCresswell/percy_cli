import GenericProvider from '../../src/providers/genericProvider.js';
import Driver from '../../src/driver.js';
import MetaDataResolver from '../../src/metadata/metaDataResolver.js';
import DesktopMetaData from '../../src/metadata/desktopMetaData.js';
import MobileMetaData from '../../src/metadata/mobileMetaData.js';

describe('GenericProvider', () => {
  let genericProvider;
  let capabilitiesSpy;

  beforeEach(() => {
    capabilitiesSpy = spyOn(Driver.prototype, 'getCapabilites')
      .and.returnValue(Promise.resolve({ browserName: 'Chrome' }));
  });

  describe('createDriver', () => {
    let metaDataResolverSpy;
    let expectedDriver;

    beforeEach(() => {
      metaDataResolverSpy = spyOn(MetaDataResolver, 'resolve');
      expectedDriver = new Driver('123', 'http:executorUrl', {});
    });

    it('creates driver', async () => {
      genericProvider = new GenericProvider('123', 'http:executorUrl', {});
      await genericProvider.createDriver();
      expect(genericProvider.driver).toEqual(expectedDriver);
      expect(capabilitiesSpy).toHaveBeenCalledTimes(1);
      expect(metaDataResolverSpy).toHaveBeenCalledWith(expectedDriver, { browserName: 'Chrome' }, {});
    });
  });

  describe('getTiles', () => {
    beforeEach(() => {
      spyOn(Driver.prototype, 'takeScreenshot').and.returnValue(Promise.resolve('123b='));
      spyOn(GenericProvider.prototype, 'getWindowHeight').and.returnValue(Promise.resolve(1947));
    });

    it('creates tiles from screenshot', async () => {
      genericProvider = new GenericProvider('123', 'http:executorUrl', { platform: 'win' }, {}, 'local-poc-poa', 'staging-poc-poa', {});
      genericProvider.createDriver();
      const tiles = await genericProvider.getTiles(123, 456, false);
      expect(tiles.tiles.length).toEqual(1);
      expect(tiles.tiles[0].navBarHeight).toEqual(0);
      expect(tiles.tiles[0].statusBarHeight).toEqual(0);
      expect(tiles.tiles[0].footerHeight).toEqual(456);
      expect(tiles.tiles[0].headerHeight).toEqual(123);
      expect(Object.keys(tiles)).toContain('domInfoSha');
    });

    it('throws error if driver not initailized', async () => {
      genericProvider = new GenericProvider('123', 'http:executorUrl', { platform: 'win' }, {}, 'local-poc-poa', 'staging-poc-poa', {});
      await expectAsync(genericProvider.getTiles(false)).toBeRejectedWithError('Driver is null, please initialize driver with createDriver().');
    });
  });

  describe('getTag', () => {
    beforeEach(() => {
      spyOn(DesktopMetaData.prototype, 'windowSize')
        .and.returnValue(Promise.resolve({ width: 1000, height: 1000 }));
      spyOn(DesktopMetaData.prototype, 'orientation')
        .and.returnValue('landscape');
      spyOn(DesktopMetaData.prototype, 'deviceName')
        .and.returnValue('mockDeviceName');
      spyOn(DesktopMetaData.prototype, 'osName')
        .and.returnValue('mockOsName');
      spyOn(DesktopMetaData.prototype, 'osVersion')
        .and.returnValue('mockOsVersion');
      spyOn(DesktopMetaData.prototype, 'browserName')
        .and.returnValue('mockBrowserName');
      spyOn(DesktopMetaData.prototype, 'browserVersion')
        .and.returnValue('111');
      spyOn(DesktopMetaData.prototype, 'screenResolution')
        .and.returnValue('1980 x 1080');
      spyOn(MobileMetaData.prototype, 'windowSize')
        .and.returnValue(Promise.resolve({ width: 1000, height: 1000 }));
      spyOn(MobileMetaData.prototype, 'orientation')
        .and.returnValue('landscape');
      spyOn(MobileMetaData.prototype, 'deviceName')
        .and.returnValue('mockDeviceName');
      spyOn(MobileMetaData.prototype, 'osVersion')
        .and.returnValue('mockOsVersion');
      spyOn(MobileMetaData.prototype, 'browserName')
        .and.returnValue('mockBrowserName');
      spyOn(MobileMetaData.prototype, 'browserVersion')
        .and.returnValue('111');
      spyOn(MobileMetaData.prototype, 'screenResolution')
        .and.returnValue('1980 x 1080');
    });

    it('returns correct tag for android', async () => {
      genericProvider = new GenericProvider('123', 'http:executorUrl', { platform: 'android', platformName: 'android' }, {}, 'local-poc-poa', 'staging-poc-poa', {});
      spyOn(MobileMetaData.prototype, 'osName').and.returnValue('android');
      await genericProvider.createDriver();
      const tag = await genericProvider.getTag();
      expect(tag).toEqual({
        name: 'mockDeviceName',
        osName: 'android',
        osVersion: 'mockOsVersion',
        width: 1000,
        height: 1000,
        orientation: 'landscape',
        browserName: 'mockBrowserName',
        browserVersion: '111',
        resolution: '1980 x 1080'
      });
    });

    it('returns correct tag for others', async () => {
      genericProvider = new GenericProvider('123', 'http:executorUrl', { platform: 'win' }, {}, 'local-poc-poa', 'staging-poc-poa', {});
      spyOn(MobileMetaData.prototype, 'osName').and.returnValue('mockOsName');
      await genericProvider.createDriver();
      const tag = await genericProvider.getTag();
      expect(tag).toEqual({
        name: 'mockDeviceName',
        osName: 'mockOsName',
        osVersion: 'mockOsVersion',
        width: 1000,
        height: 1000,
        orientation: 'landscape',
        browserName: 'mockBrowserName',
        browserVersion: '111',
        resolution: '1980 x 1080'
      });
    });

    it('throws error if driver not initailized', async () => {
      genericProvider = new GenericProvider('123', 'http:executorUrl', { platform: 'win' }, {}, 'local-poc-poa', 'staging-poc-poa', {});
      await expectAsync(genericProvider.getTag()).toBeRejectedWithError('Driver is null, please initialize driver with createDriver().');
    });
  });

  describe('screenshot', () => {
    let getTagSpy;
    let getTilesSpy;

    beforeEach(() => {
      getTagSpy = spyOn(GenericProvider.prototype, 'getTag').and.returnValue(Promise.resolve('mock-tag'));
      getTilesSpy = spyOn(GenericProvider.prototype, 'getTiles').and.returnValue(Promise.resolve({ tiles: 'mock-tile', domInfoSha: 'mock-dom-sha' }));
      spyOn(DesktopMetaData.prototype, 'windowSize')
        .and.returnValue(Promise.resolve({ width: 1920, height: 1080 }));
    });

    it('calls correct funcs', async () => {
      genericProvider = new GenericProvider('123', 'http:executorUrl', { platform: 'win' }, {}, 'local-poc-poa', 'staging-poc-poa', {});
      await genericProvider.createDriver();
      let res = await genericProvider.screenshot('mock-name', {});
      expect(getTagSpy).toHaveBeenCalledTimes(1);
      expect(getTilesSpy).toHaveBeenCalledOnceWith(0, 0, false);
      expect(res).toEqual({
        name: 'mock-name',
        tag: 'mock-tag',
        tiles: 'mock-tile',
        externalDebugUrl: 'https://localhost/v1',
        environmentInfo: 'staging-poc-poa',
        ignoredElementsData: { ignoreElementsData: [] },
        consideredElementsData: { considerElementsData: [] },
        clientInfo: 'local-poc-poa',
        domInfoSha: 'mock-dom-sha',
        metadata: null
      });
    });
  });

  describe('getWindowHeight', () => {
    beforeEach(() => {
      spyOn(Driver.prototype, 'executeScript').and.returnValue(Promise.resolve(true));
    });

    it('should call executeScript to get windowHeight', async () => {
      genericProvider = new GenericProvider('123', 'http:executorUrl', { platform: 'win' }, {}, 'local-poc-poa', 'staging-poc-poa', {});
      await genericProvider.createDriver();
      await genericProvider.getWindowHeight();
      expect(genericProvider.driver.executeScript).toHaveBeenCalledTimes(1);
      expect(genericProvider.driver.executeScript).toHaveBeenCalledWith({ script: 'return window.innerHeight', args: [] });
    });
  });

  describe('getRegionObject', () => {
    let provider;
    let mockLocation = { x: 10, y: 20, width: 100, height: 200 };
    beforeEach(() => {
      // mock metadata
      provider = new GenericProvider('123', 'http:executorUrl', { platform: 'win' }, {});
      spyOn(DesktopMetaData.prototype, 'devicePixelRatio')
        .and.returnValue(1);
      spyOn(Driver.prototype, 'rect').and.returnValue(Promise.resolve(mockLocation));
    });

    it('should return a JSON object with the correct selector and coordinates', async () => {
      await provider.createDriver();

      // Call function with mock data
      const selector = 'mock-selector';
      const result = await provider.getRegionObject(selector, 'mockElementId');

      // Assert expected result
      expect(result.selector).toEqual(selector);
      expect(result.coOrdinates).toEqual({
        top: mockLocation.y,
        bottom: mockLocation.y + mockLocation.height,
        left: mockLocation.x,
        right: mockLocation.x + mockLocation.width
      });
    });
  });

  describe('getSeleniumRegionsByXpaths', () => {
    let getRegionObjectSpy;
    let provider;

    beforeEach(async () => {
      provider = new GenericProvider('123', 'http:executorUrl', { platform: 'win' }, {});
      await provider.createDriver();
      getRegionObjectSpy = spyOn(GenericProvider.prototype, 'getRegionObject').and.returnValue({});
    });

    it('should add regions for each xpath', async () => {
      spyOn(Driver.prototype, 'findElement').and.returnValue(Promise.resolve({ ELEMENT: 'mock_id' }));
      const xpaths = ['/xpath/1', '/xpath/2', '/xpath/3'];

      const elementsArray = await provider.getSeleniumRegionsBy('xpath', xpaths);

      expect(provider.driver.findElement).toHaveBeenCalledTimes(3);
      expect(getRegionObjectSpy).toHaveBeenCalledTimes(3);
      expect(elementsArray).toEqual([{}, {}, {}]);
    });

    it('should ignore xpath when element is not found', async () => {
      spyOn(Driver.prototype, 'findElement').and.rejectWith(new Error('Element not found'));
      const xpaths = ['/xpath/1', '/xpath/2', '/xpath/3'];

      const elementsArray = await provider.getSeleniumRegionsBy('xpath', xpaths);

      expect(provider.driver.findElement).toHaveBeenCalledTimes(3);
      expect(getRegionObjectSpy).not.toHaveBeenCalled();
      expect(elementsArray).toEqual([]);
    });
  });

  describe('getSeleniumRegionsBySelector', () => {
    let getRegionObjectSpy;
    let provider;

    beforeEach(async () => {
      provider = new GenericProvider('123', 'http:executorUrl', { platform: 'win' }, {});
      await provider.createDriver();
      getRegionObjectSpy = spyOn(GenericProvider.prototype, 'getRegionObject').and.returnValue({});
    });

    it('should add regions for each id', async () => {
      spyOn(Driver.prototype, 'findElement').and.returnValue(Promise.resolve({ ELEMENT: 'mock_id' }));
      const ids = ['#id1', '#id2', '#id3'];

      const elementsArray = await provider.getSeleniumRegionsBy('css selector', ids);

      expect(provider.driver.findElement).toHaveBeenCalledTimes(3);
      expect(getRegionObjectSpy).toHaveBeenCalledTimes(3);
      expect(elementsArray).toEqual([{}, {}, {}]);
    });

    it('should ignore id when element is not found', async () => {
      spyOn(Driver.prototype, 'findElement').and.rejectWith(new Error('Element not found'));
      const ids = ['#id1', '#id2', '#id3'];

      const elementsArray = await provider.getSeleniumRegionsBy('css selector', ids);

      expect(provider.driver.findElement).toHaveBeenCalledTimes(3);
      expect(getRegionObjectSpy).not.toHaveBeenCalled();
      expect(elementsArray).toEqual([]);
    });
  });

  describe('getSeleniumRegionsByElement', () => {
    let getRegionObjectSpy;
    let provider;

    beforeEach(async () => {
      provider = new GenericProvider('123', 'http:executorUrl', { platform: 'win' }, {});
      await provider.createDriver();
      getRegionObjectSpy = spyOn(GenericProvider.prototype, 'getRegionObject').and.returnValue({});
    });

    it('should add regions for each element', async () => {
      const elements = ['mockElement_1', 'mockElement_2', 'mockElement_3'];

      const elementsArray = await provider.getSeleniumRegionsByElement(elements);

      expect(getRegionObjectSpy).toHaveBeenCalledTimes(3);
      expect(elementsArray).toEqual([{}, {}, {}]);
    });

    it('should ignore when error', async () => {
      getRegionObjectSpy.and.rejectWith(new Error('Element not found'));
      const elements = ['mockElement_1', 'mockElement_2', 'mockElement_3'];

      const elementsArray = await provider.getSeleniumRegionsByElement(elements);

      expect(elementsArray).toEqual([]);
    });
  });

  describe('getSeleniumRegionsByLocation', () => {
    let provider;

    beforeEach(async () => {
      provider = new GenericProvider('123', 'http:executorUrl', { platform: 'win' }, {});
      await provider.createDriver();
      spyOn(DesktopMetaData.prototype, 'windowSize')
        .and.returnValue(Promise.resolve({ width: 1920, height: 1080 }));
    });

    it('should add custom regions to the provided array', async () => {
      const customLocations = [
        { top: 100, bottom: 200, left: 100, right: 200 },
        { top: 300, bottom: 400, left: 300, right: 400 }
      ];

      const elementsArray = await provider.getSeleniumRegionsByLocation(customLocations);

      expect(elementsArray).toEqual([
        {
          selector: 'custom region 0',
          coOrdinates: { top: 100, bottom: 200, left: 100, right: 200 }
        },
        {
          selector: 'custom region 1',
          coOrdinates: { top: 300, bottom: 400, left: 300, right: 400 }
        }
      ]);
    });

    it('should ignore invalid custom regions', async () => {
      const customLocations = [
        { top: 100, bottom: 1090, left: 100, right: 200 },
        { top: 300, bottom: 400, left: 300, right: 1921 }
      ];

      const elementsArray = await provider.getSeleniumRegionsByLocation(customLocations);

      expect(elementsArray).toEqual([]);
    });
  });
});

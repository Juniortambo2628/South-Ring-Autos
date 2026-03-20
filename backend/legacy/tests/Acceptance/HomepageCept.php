<?php

/**
 * End-to-End Test: Homepage
 * Tests the main homepage loads correctly
 */
$I = new AcceptanceTester($scenario);
$I->wantTo('verify the homepage loads correctly');
$I->amOnPage('/');
$I->see('South Ring Autos', 'h1, .navbar-brand');
$I->seeResponseCodeIs(200);

